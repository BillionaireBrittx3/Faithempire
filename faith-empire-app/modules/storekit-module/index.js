import { Platform } from 'react-native';

let StoreKitModule = null;
let emitter = null;

if (Platform.OS === 'ios') {
  try {
    const { requireNativeModule, EventEmitter } = require('expo-modules-core');
    StoreKitModule = requireNativeModule('StoreKitModule');
    emitter = new EventEmitter(StoreKitModule);
  } catch (e) {
    console.log('StoreKit module not available:', e.message);
  }
}

export function purchase(productId) {
  if (StoreKitModule) {
    return StoreKitModule.purchase(productId);
  }
  console.log('StoreKit not available on this platform');
}

export function restorePurchases() {
  if (StoreKitModule) {
    return StoreKitModule.restorePurchases();
  }
  console.log('StoreKit not available on this platform');
}

export function addPurchaseCompleteListener(listener) {
  if (emitter) {
    return emitter.addListener('onPurchaseComplete', listener);
  }
  return { remove: () => {} };
}

export function addPurchaseFailedListener(listener) {
  if (emitter) {
    return emitter.addListener('onPurchaseFailed', listener);
  }
  return { remove: () => {} };
}

export function addRestoreCompleteListener(listener) {
  if (emitter) {
    return emitter.addListener('onRestoreComplete', listener);
  }
  return { remove: () => {} };
}
