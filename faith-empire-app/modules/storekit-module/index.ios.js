import { requireNativeModule, EventEmitter } from 'expo-modules-core';

const StoreKitModule = requireNativeModule('StoreKitModule');
const emitter = new EventEmitter(StoreKitModule);

export function purchase(productId) {
  return StoreKitModule.purchase(productId);
}

export function restorePurchases() {
  return StoreKitModule.restorePurchases();
}

export function addPurchaseCompleteListener(listener) {
  return emitter.addListener('onPurchaseComplete', listener);
}

export function addPurchaseFailedListener(listener) {
  return emitter.addListener('onPurchaseFailed', listener);
}

export function addRestoreCompleteListener(listener) {
  return emitter.addListener('onRestoreComplete', listener);
}
