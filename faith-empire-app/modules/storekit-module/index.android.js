export function purchase(productId) {
  console.log('StoreKit is not available on Android');
}

export function restorePurchases() {
  console.log('StoreKit is not available on Android');
}

export function addPurchaseCompleteListener(listener) {
  return { remove: () => {} };
}

export function addPurchaseFailedListener(listener) {
  return { remove: () => {} };
}

export function addRestoreCompleteListener(listener) {
  return { remove: () => {} };
}
