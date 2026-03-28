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
const IS_IOS = Platform.OS === 'ios';

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
    if (!IS_IOS) return;

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
    if (!IS_IOS) {
      sendToWebView({ type: 'PURCHASE_FAILED', reason: 'not_supported' });
      return;
    }
    try {
      purchase(PRODUCT_ID);
    } catch (err) {
      console.log('Purchase error:', err);
      sendToWebView({ type: 'PURCHASE_FAILED', reason: 'error' });
    }
  }

  function handleRestore() {
    if (!IS_IOS) {
      sendToWebView({ type: 'RESTORE_COMPLETE', isPremium: false });
      return;
    }
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
          if (IS_IOS) {
            Linking.openURL('https://apps.apple.com/account/subscriptions');
          } else {
            Linking.openURL('https://play.google.com/store/account/subscriptions');
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.log('Message parse error:', err);
    }
  }, [isPremium]);

  const platformUrl = IS_IOS
    ? APP_URL
    : `${APP_URL}?platform=android`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <WebView
        ref={webViewRef}
        source={{ uri: platformUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={IS_IOS}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled={true}
        originWhitelist={['*']}
        decelerationRate="normal"
        contentMode="mobile"
        pullToRefreshEnabled={true}
        onMessage={handleWebViewMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView HTTP error:', nativeEvent.statusCode);
        }}
        renderError={(errorDomain, errorCode, errorDesc) => {
          return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <StatusBar style="light" backgroundColor="#000000" />
            </SafeAreaView>
          );
        }}
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
