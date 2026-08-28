import fs from 'fs';
import path from 'path';
import ts from 'typescript';

type Violation = {
  file: string;
  line: number;
  text: string;
};

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const UI_ROOTS = [
  'src/components',
  'src/navigation',
  'src/screens',
];

const EXTRA_UI_FILES = [
  'src/services/notifications.ts',
  'src/stores/projectGalleryStore.ts',
];

// Product names, platform names, and compact technical badges are intentionally
// language-independent. Every other user-facing literal belongs in translations.
const LANGUAGE_INDEPENDENT_TEXT = new Set([
  '4K',
  'CORIVO',
  'Corivo',
  'FX',
  'Instagram',
  'X',
]);

const VISIBLE_ATTRIBUTES = new Set([
  'accessibilityHint',
  'accessibilityLabel',
  'label',
  'message',
  'placeholder',
  'title',
]);

const collectFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry: {
    name: string;
    isDirectory: () => boolean;
  }) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : collectFiles(entryPath);
    }
    return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });

const literalText = (node: ts.Node): string | null => {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
};

const tagName = (node: ts.JsxElement): string =>
  node.openingElement.tagName.getText();

const isInsideTextExpression = (node: ts.Node): boolean => {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (ts.isJsxAttribute(current)) return false;
    if (ts.isJsxExpression(current)) {
      const parent = current.parent;
      return ts.isJsxElement(parent) &&
        ['Text', 'SvgText'].includes(tagName(parent));
    }
    current = current.parent;
  }
  return false;
};

const containingFunctionName = (node: ts.Node): string | null => {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) {
      return current.name.text;
    }
    if (
      (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) &&
      ts.isVariableDeclaration(current.parent) &&
      ts.isIdentifier(current.parent.name)
    ) {
      return current.parent.name.text;
    }
    current = current.parent;
  }
  return null;
};

const scanFile = (absolutePath: string): Violation[] => {
  const sourceText = fs.readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    absolutePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    absolutePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const violations: Violation[] = [];
  const seen = new Set<number>();

  const add = (node: ts.Node, text: string) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (
      !normalized ||
      !/\p{L}/u.test(normalized) ||
      LANGUAGE_INDEPENDENT_TEXT.has(normalized) ||
      seen.has(node.getStart(sourceFile))
    ) {
      return;
    }

    seen.add(node.getStart(sourceFile));
    const location = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile),
    );
    violations.push({
      file: path.relative(PROJECT_ROOT, absolutePath),
      line: location.line + 1,
      text: normalized,
    });
  };

  const collectLiterals = (node: ts.Node) => {
    const text = literalText(node);
    if (text !== null) add(node, text);
    ts.forEachChild(node, collectLiterals);
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      add(node, node.getText(sourceFile));
    }

    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      VISIBLE_ATTRIBUTES.has(node.name.text) &&
      node.initializer
    ) {
      if (ts.isStringLiteral(node.initializer)) {
        add(node.initializer, node.initializer.text);
      } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        collectLiterals(node.initializer.expression);
      }
    }

    const text = literalText(node);
    if (text !== null && isInsideTextExpression(node)) {
      add(node, text);
    }

    if (ts.isCallExpression(node)) {
      const callName = node.expression.getText(sourceFile);
      if (callName === 'Alert.alert') {
        node.arguments.slice(0, 2).forEach(collectLiterals);
        const actions = node.arguments[2];
        if (actions && ts.isArrayLiteralExpression(actions)) {
          actions.elements.forEach(element => {
            if (!ts.isObjectLiteralExpression(element)) return;
            element.properties.forEach(property => {
              if (
                ts.isPropertyAssignment(property) &&
                property.name.getText(sourceFile).replace(/["']/g, '') === 'text'
              ) {
                collectLiterals(property.initializer);
              }
            });
          });
        }
      }

      if (callName === 'setError' && node.arguments[0]) {
        collectLiterals(node.arguments[0]);
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const propertyName = node.name.getText(sourceFile).replace(/["']/g, '');
      if (
        ['actionTitle', 'label', 'menuTitle'].includes(propertyName) &&
        !ts.isObjectLiteralExpression(node.initializer)
      ) {
        collectLiterals(node.initializer);
      }
      if (
        propertyName === 'name' &&
        absolutePath.endsWith('projectGalleryStore.ts')
      ) {
        collectLiterals(node.initializer);
      }
      if (
        ['body', 'name', 'title'].includes(propertyName) &&
        absolutePath.endsWith('notifications.ts')
      ) {
        collectLiterals(node.initializer);
      }
    }

    if (
      ts.isReturnStatement(node) &&
      node.expression &&
      containingFunctionName(node) === 'formatTimestamp'
    ) {
      collectLiterals(node.expression);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return violations;
};

describe('UI localization', () => {
  it('contains no hardcoded user-facing strings', () => {
    const files = [
      ...UI_ROOTS.flatMap(root => collectFiles(path.join(PROJECT_ROOT, root))),
      ...EXTRA_UI_FILES.map(file => path.join(PROJECT_ROOT, file)),
    ];
    const violations = files.flatMap(scanFile);

    expect(
      violations.map(
        violation =>
          `${violation.file}:${violation.line} -> ${JSON.stringify(violation.text)}`,
      ),
    ).toEqual([]);
  });
});
