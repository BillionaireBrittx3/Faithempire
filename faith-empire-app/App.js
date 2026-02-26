import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Platform, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useEffect, useState } from 'react';
import {
  initConnection,
  endConnection,
  getProducts,
  requestSubscription,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';

const APP_URL = 'https://faithempire.replit.app';
const PRODUCT_ID = 'com.decodedfaithempire.app.premium.monthly';

export default function App() {
  const webViewRef = useRef(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let purchaseUpdateSubscription = null;
    let purchaseErrorSubscription = null;
    let isMounted = true;

    async function initIAP() {
      try {
        await initConnection();

        purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
          if (!isMounted) return;

          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              await finishTransaction({ purchase, isConsumable: false });
            } catch (err) {
              console.log('Finish transaction error:', err);
            }
            setIsPremium(true);
            sendToWebView({ type: 'PURCHASE_COMPLETE', isPremium: true });
          }
        });

        purchaseErrorSubscription = purchaseErrorListener((error) => {
          if (!isMounted) return;
          if (error.code === 'E_USER_CANCELLED') {
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
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      endConnection();
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
      const products = await getProducts({ skus: [PRODUCT_ID] });
      if (products && products.length > 0) {
        await requestSubscription({ sku: PRODUCT_ID });
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
      const purchases = await getAvailablePurchases();
      const hasActive = purchases && purchases.some(p => p.productId === PRODUCT_ID);
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
        case 'OPEN_SUBSCRIPTION_SETTINGS':
          Linking.openURL('https://apps.apple.com/account/subscriptions');
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
