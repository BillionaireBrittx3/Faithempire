import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Platform, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  purchase,
  restorePurchases,
  addPurchaseCompleteListener,
  addPurchaseFailedListener,
  addRestoreCompleteListener,
} from './modules/storekit-module';

const APP_URL = 'https://faithempire.replit.app';
const PRODUCT_ID = 'com.decodedfaithempire.app.premium.monthly';

export default function App() {
  const webViewRef = useRef(null);
  const [isPremium, setIsPremium] = useState(false);

  function sendToWebView(data) {
    if (webViewRef.current) {
      const script = `window.postMessage(${JSON.stringify(JSON.stringify(data))}, '*'); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }

  useEffect(() => {
    const purchaseSub = addPurchaseCompleteListener(({ productId }) => {
      setIsPremium(true);
      sendToWebView({ type: 'PURCHASE_COMPLETE', isPremium: true });
    });

    const failedSub = addPurchaseFailedListener(({ reason }) => {
      if (reason === 'cancelled') {
        sendToWebView({ type: 'PURCHASE_FAILED', reason: 'cancelled' });
      } else {
        sendToWebView({ type: 'PURCHASE_FAILED', reason });
      }
    });

    const restoreSub = addRestoreCompleteListener(({ productIds }) => {
      const hasActive = productIds && productIds.includes(PRODUCT_ID);
      setIsPremium(hasActive);
      sendToWebView({ type: 'RESTORE_COMPLETE', isPremium: hasActive });
      if (!hasActive) {
        Alert.alert('No Subscription Found', 'No active premium subscription was found for this Apple ID.');
      }
    });

    return () => {
      purchaseSub.remove();
      failedSub.remove();
      restoreSub.remove();
    };
  }, []);

  function handlePurchase() {
    try {
      purchase(PRODUCT_ID);
    } catch (err) {
      console.log('Purchase error:', err);
      sendToWebView({ type: 'PURCHASE_FAILED', reason: 'error' });
    }
  }

  function handleRestore() {
    try {
      restorePurchases();
    } catch (err) {
      console.log('Restore error:', err);
      sendToWebView({ type: 'RESTORE_COMPLETE', isPremium: false });
    }
  }

  function handleCheckSubscription() {
    sendToWebView({ type: 'SUBSCRIPTION_STATUS', isPremium });
  }

  const handleWebViewMessage = useCallback((event) => {
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
  }, [isPremium]);

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
