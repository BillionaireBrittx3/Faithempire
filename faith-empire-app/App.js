import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useEffect, useState } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';

const APP_URL = 'https://faithempire.replit.app';
const PRODUCT_ID = 'com.decodedfaithempire.app.premium.monthly';

export default function App() {
  const webViewRef = useRef(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initIAP() {
      try {
        await InAppPurchases.connectAsync();

        InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
          if (!isMounted) return;

          if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
            for (const purchase of results) {
              if (!purchase.acknowledged) {
                InAppPurchases.finishTransactionAsync(purchase, false);
              }
            }
            setIsPremium(true);
            sendToWebView({ type: 'PURCHASE_COMPLETE', isPremium: true });
          } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
            sendToWebView({ type: 'PURCHASE_FAILED', reason: 'cancelled' });
          } else {
            sendToWebView({ type: 'PURCHASE_FAILED', reason: 'error' });
          }
        });
      } catch (err) {
        console.log('IAP init error:', err);
      }
    }

    initIAP();

    return () => {
      isMounted = false;
      InAppPurchases.disconnectAsync().catch(() => {});
    };
  }, []);

  function sendToWebView(data) {
    if (webViewRef.current) {
      const script = `window.postMessage(${JSON.stringify(JSON.stringify(data))}, '*'); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }

  async function handlePurchase() {
    try {
      const { responseCode, results } = await InAppPurchases.getProductsAsync([PRODUCT_ID]);
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results && results.length > 0) {
        await InAppPurchases.purchaseItemAsync(PRODUCT_ID);
      } else {
        sendToWebView({ type: 'PURCHASE_FAILED', reason: 'product_not_found' });
        Alert.alert(
          'Subscription Unavailable',
          'The subscription product is not yet configured. Please try again later.'
        );
      }
    } catch (err) {
      console.log('Purchase error:', err);
      sendToWebView({ type: 'PURCHASE_FAILED', reason: 'error' });
    }
  }

  async function handleRestore() {
    try {
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      const hasActive = responseCode === InAppPurchases.IAPResponseCode.OK &&
        results && results.some(p => p.productId === PRODUCT_ID);
      setIsPremium(hasActive);
      sendToWebView({ type: 'RESTORE_COMPLETE', isPremium: hasActive });
      if (!hasActive) {
        Alert.alert('No Subscription Found', 'No active premium subscription was found for this Apple ID.');
      }
    } catch (err) {
      console.log('Restore error:', err);
      sendToWebView({ type: 'RESTORE_COMPLETE', isPremium: false });
    }
  }

  function handleCheckSubscription() {
    sendToWebView({ type: 'SUBSCRIPTION_STATUS', isPremium });
  }

  function handleWebViewMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'PURCHASE':
          handlePurchase();
          break;
        case 'RESTORE_PURCHASES':
          handleRestore();
          break;
        case 'CHECK_SUBSCRIPTION':
          handleCheckSubscription();
          break;
        default:
          break;
      }
    } catch (err) {
      console.log('Message parse error:', err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <WebView
        ref={webViewRef}
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
        onMessage={handleWebViewMessage}
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
