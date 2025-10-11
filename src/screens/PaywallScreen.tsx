import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Colors, Gradients } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import crown from "../assets/images/crown.png"

const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const setProUser = useAppStore(state => state.setProUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleUnlockPro = async () => {
    setIsLoading(true);

    try {
      // Simulate IAP purchase flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, always succeed
      setProUser(true);

      Alert.alert(
        'Welcome to Artifex Pro!',
        'You now have access to all premium features.',
        [
          {
            text: 'Get Started',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Purchase Failed',
        'Something went wrong. Please try again or contact support.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);

    try {
      // Simulate restore flow
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo, show no purchase found
      Alert.alert(
        'No Purchase Found',
        "We couldn't find a previous purchase on this Apple ID.",
        [{ text: 'OK' }],
      );
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const renderFeature = (icon: string, text: string) => (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.crownContainer}>
            <Image source={crown} style={styles.crownIcon} />
          </View>
          <Text style={styles.heroTitle}>Artifex Pro</Text>
          <Text style={styles.heroSubtitle}>Unlock the Full Experience</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          {renderFeature('✓', '100+ Premium Stickers')}
          {renderFeature('✓', '30+ Exclusive Fonts')}
          {renderFeature('✓', 'Advanced Filters')}
          {renderFeature('✓', 'Custom Watermarks')}
          {renderFeature('✓', 'No "Made with Artifex" Mark')}
          {renderFeature('✓', 'Priority Support')}
        </View>

        {/* Purchase Section */}
        <View style={styles.purchaseSection}>
          <Text style={styles.purchaseLabel}>One-Time Purchase</Text>
          <Text style={styles.price}>$9.99 USD</Text>
          <Text style={styles.purchaseSubtext}>
            Lifetime access. No subscriptions.
          </Text>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.ctaButtonLoading]}
            onPress={handleUnlockPro}
            disabled={isLoading}
          >
            <Text style={styles.ctaButtonText}>
              {isLoading ? 'Processing...' : 'Unlock Pro'}
            </Text>
          </TouchableOpacity>

          {/* Restore Purchases */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
          >
            <Text style={styles.restoreButtonText}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Terms of Service', 'This will open terms')
            }
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Privacy Policy', 'This will open privacy policy')
            }
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Refund Policy', 'This will open refund policy')
            }
          >
            <Text style={styles.legalLink}>Refund Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: Spacing.m,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.l,
  },
  crownContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  crownIcon: {
    width: 64,
    height: 64,
  },
  heroTitle: {
    ...Typography.display.hero,
    color: Colors.text.primary,
    marginBottom: Spacing.s,
  },
  heroSubtitle: {
    ...Typography.body.large,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: Spacing.l,
    marginBottom: Spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  featureIcon: {
    fontSize: 20,
    color: Colors.accent.primary,
    marginRight: Spacing.m,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  purchaseSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
    marginBottom: Spacing.xl,
  },
  purchaseLabel: {
    ...Typography.body.small,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  price: {
    ...Typography.display.hero,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  purchaseSubtext: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    width: '90%',
    height: AppDimensions.button.height,
    backgroundColor: Colors.accent.primary,
    borderRadius: AppDimensions.button.cornerRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    shadowColor: Colors.accent.primary,
    elevation: 8,
  },
  ctaButtonLoading: {
    opacity: 0.7,
  },
  ctaButtonText: {
    ...Typography.ui.button,
    color: Colors.backgrounds.primary,
  },
  restoreButton: {
    paddingVertical: Spacing.s,
  },
  restoreButtonText: {
    ...Typography.body.small,
    color: Colors.accent.secondary,
  },
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  legalLink: {
    ...Typography.body.finePrint,
    color: Colors.text.subtle,
  },
  legalSeparator: {
    ...Typography.body.finePrint,
    color: Colors.text.subtle,
    marginHorizontal: Spacing.xs,
  },
});

export default PaywallScreen;
