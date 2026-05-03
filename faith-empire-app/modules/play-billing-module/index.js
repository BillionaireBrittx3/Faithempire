import { Platform } from 'react-native';

let nativeModule = null;
let emitter = null;

if (Platform.OS === 'android') {
  const { requireNativeModule, EventEmitter } = require('expo-modules-core');
  nativeModule = requireNativeModule('PlayBillingModule');
  emitter = new EventEmitter(nativeModule);
}

export function purchase(productId) {
  if (!nativeModule) {
    console.log('PlayBilling is not available on this platform');
    return;
  }
  return nativeModule.purchase(productId);
}

export function restorePurchases() {
  if (!nativeModule) {
    console.log('PlayBilling is not available on this platform');
    return;
  }
  return nativeModule.restorePurchases();
}

export function addPurchaseCompleteListener(listener) {
  if (!emitter) return { remove: () => {} };
  return emitter.addListener('onPurchaseComplete', listener);
}

export function addPurchaseFailedListener(listener) {
  if (!emitter) return { remove: () => {} };
  return emitter.addListener('onPurchaseFailed', listener);
}

export function addRestoreCompleteListener(listener) {
  if (!emitter) return { remove: () => {} };
  return emitter.addListener('onRestoreComplete', listener);
}
