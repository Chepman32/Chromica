// In-App Purchase utilities for Artifex Pro

import { Alert } from 'react-native';
import { useAppStore } from '../stores/appStore';

// Mock IAP implementation - would be replaced with react-native-iap
// For now, this provides the interface and basic functionality

export interface IAPProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

const ARTIFEX_PRO_PRODUCT_ID = 'com.artifex.pro';

// Mock product data
const MOCK_PRODUCT: IAPProduct = {
  productId: ARTIFEX_PRO_PRODUCT_ID,
  price: '$9.99',
  currency: 'USD',
  title: 'Artifex Pro',
  description:
    'Unlock all premium features, remove watermarks, and access 100+ exclusive assets',
};

class IAPManager {
  private isInitialized = false;

  async initialize(): Promise<void> {
    // Mock initialization
    this.isInitialized = true;
    console.log('IAP Manager initialized');
  }

  async getProducts(): Promise<IAPProduct[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // In a real implementation, this would fetch from App Store/Play Store
    return [MOCK_PRODUCT];
  }

  async purchasePro(): Promise<PurchaseResult> {
    try {
      // Mock purchase flow
      return new Promise(resolve => {
        Alert.alert(
          'Purchase Artifex Pro',
          `${MOCK_PRODUCT.price} - ${MOCK_PRODUCT.description}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () =>
                resolve({ success: false, error: 'User cancelled' }),
            },
            {
              text: 'Buy',
              onPress: () => {
                // Simulate successful purchase
                this.handleSuccessfulPurchase();
                resolve({
                  success: true,
                  transactionId: `mock_${Date.now()}`,
                });
              },
            },
          ],
        );
      });
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      // Mock restore - in real app, this would check with App Store/Play Store
      const hasExistingPurchase = false; // Would check actual purchase history

      if (hasExistingPurchase) {
        this.handleSuccessfulPurchase();
        return { success: true };
      } else {
        return { success: false, error: 'No purchases to restore' };
      }
    } catch (error) {
      console.error('Restore failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      };
    }
  }

  private handleSuccessfulPurchase(): void {
    // Update app store to reflect Pro status
    useAppStore.getState().setProUser(true);

    Alert.alert(
      'Purchase Successful! 🎉',
      'Welcome to Artifex Pro! All premium features are now unlocked.',
      [{ text: 'Awesome!', style: 'default' }],
    );
  }

  async validateReceipt(receiptData: string): Promise<boolean> {
    // Mock receipt validation
    // In a real app, this would validate with your backend server
    console.log('Validating receipt:', receiptData);
    return true;
  }
}

// Singleton instance
export const iapManager = new IAPManager();

// Convenience functions
export const purchaseArtifexPro = () => iapManager.purchasePro();
export const restorePurchases = () => iapManager.restorePurchases();
export const getIAPProducts = () => iapManager.getProducts();

// Hook for components to use IAP functionality
export const useIAP = () => {
  const isProUser = useAppStore(state => state.isProUser);

  return {
    isProUser,
    purchasePro: purchaseArtifexPro,
    restorePurchases,
    getProducts: getIAPProducts,
  };
};
