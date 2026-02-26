import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Platform, NativeModules } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef } from 'react';

const APP_URL = 'https://faithempire.replit.app';
const StoreKitIAP = NativeModules.StoreKitIAPModule;

export default function App() {
  const webviewRef = useRef(null);

  const sendToWebView = (type, data) => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({ type, ...data }));
    }
  };

  const handleMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const { type, requestId } = message;
      if (!StoreKitIAP) {
        sendToWebView('iap_error', { requestId, error: 'StoreKit not available' });
        return;
      }
      switch (type) {
        case 'iap_get_products': {
          try {
            const products = await StoreKitIAP.getProducts(message.productIds || []);
            sendToWebView('iap_products', { requestId, products });
          } catch (e) { sendToWebView('iap_error', { requestId, error: e.message }); }
          break;
        }
        case 'iap_purchase': {
          try {
            const result = await StoreKitIAP.purchaseProduct(message.productId);
            sendToWebView('iap_purchase_result', { requestId, result });
          } catch (e) { sendToWebView('iap_error', { requestId, error: e.message }); }
          break;
        }
        case 'iap_restore': {
          try {
            const restored = await StoreKitIAP.restorePurchases();
            sendToWebView('iap_restored', { requestId, productIds: restored });
          } catch (e) { sendToWebView('iap_error', { requestId, error: e.message }); }
          break;
        }
        case 'iap_check_status': {
          try {
            const isActive = await StoreKitIAP.checkSubscriptionStatus(message.productId);
            sendToWebView('iap_status', { requestId, isActive });
          } catch (e) { sendToWebView('iap_error', { requestId, error: e.message }); }
          break;
        }
        default: break;
      }
    } catch (e) { /* Not an IAP message */ }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <WebView
        ref={webviewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled={true}
        originWhitelist={['*']}
        decelerationRate="normal"
        contentMode="mobile"
        pullToRefreshEnabled={true}
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
