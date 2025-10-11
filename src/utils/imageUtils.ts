/**
 * Image utility functions
 */

import RNFS from 'react-native-fs';

/**
 * Convert a Photos framework URI (ph://) to a file:// URI that Skia can load
 */
export async function convertPhotoUriToFile(uri: string): Promise<string> {
  // If it's already a file:// URI, return as-is
  if (uri.startsWith('file://')) {
    return uri;
  }

  // If it's a ph:// URI, we need to copy it to a temporary location
  if (uri.startsWith('ph://')) {
    try {
      // Create a temporary file path
      const filename = `temp_${Date.now()}.jpg`;
      const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

      // Copy the photo to the cache directory
      // Note: RNFS can handle ph:// URIs on iOS
      await RNFS.copyFile(uri, destPath);

      return `file://${destPath}`;
    } catch (error) {
      console.error('Error converting ph:// URI:', error);
      throw error;
    }
  }

  // If it's a regular path, add file:// prefix
  if (uri.startsWith('/')) {
    return `file://${uri}`;
  }

  return uri;
}
