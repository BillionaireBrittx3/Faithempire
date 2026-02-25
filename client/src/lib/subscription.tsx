import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  subscribe: () => void;
  restorePurchases: () => void;
}

const SubscriptionContext = createContext<SubscriptionState>({
  isPremium: false,
  isLoading: true,
  subscribe: () => {},
  restorePurchases: () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

const STORAGE_KEY = "faith_empire_premium";
const PRODUCT_ID = "com.decodedfaithempire.app.premium.monthly";

function isInWebView(): boolean {
  return typeof (window as any).ReactNativeWebView !== "undefined";
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.type === "SUBSCRIPTION_STATUS") {
          setIsPremium(data.isPremium);
          localStorage.setItem(STORAGE_KEY, String(data.isPremium));
          setIsLoading(false);
        }
        if (data.type === "PURCHASE_COMPLETE") {
          setIsPremium(true);
          localStorage.setItem(STORAGE_KEY, "true");
        }
        if (data.type === "PURCHASE_FAILED") {
          setIsLoading(false);
        }
        if (data.type === "RESTORE_COMPLETE") {
          setIsPremium(data.isPremium);
          localStorage.setItem(STORAGE_KEY, String(data.isPremium));
          setIsLoading(false);
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);

    if (isInWebView()) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: "CHECK_SUBSCRIPTION" })
      );
    } else {
      setIsLoading(false);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const subscribe = useCallback(() => {
    if (isInWebView()) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: "PURCHASE", productId: PRODUCT_ID })
      );
    } else {
      window.open("https://apps.apple.com/app/id6759208291", "_blank");
    }
  }, []);

  const restorePurchases = useCallback(() => {
    if (isInWebView()) {
      setIsLoading(true);
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: "RESTORE_PURCHASES" })
      );
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPremium, isLoading, subscribe, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const FREE_DECODED_CHAPTERS = 3;
export const FREE_PODCAST_EPISODES = 2;
