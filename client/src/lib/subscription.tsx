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
const OWNER_KEY = "faith_empire_owner_access";
const PRODUCT_ID = "com.decodedfaithempire.app.premium.monthly";

function isInWebView(): boolean {
  return typeof (window as any).ReactNativeWebView !== "undefined";
}

const PREVIEW_KEY = "faith_empire_preview";
const VALID_PREVIEW_TOKENS: Record<string, number> = {
  "mutimanwa-preview-2026": new Date("2036-03-08").getTime(),
};

function checkPreviewAccess(): boolean {
  try {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("preview");
      if (token && VALID_PREVIEW_TOKENS[token]) {
        const expiry = VALID_PREVIEW_TOKENS[token];
        if (Date.now() < expiry) {
          localStorage.setItem(PREVIEW_KEY, JSON.stringify({ token, expiry }));
          window.history.replaceState({}, "", window.location.pathname);
          return true;
        }
      }
      const stored = localStorage.getItem(PREVIEW_KEY);
      if (stored) {
        const { token: t, expiry } = JSON.parse(stored);
        if (VALID_PREVIEW_TOKENS[t] && Date.now() < expiry) {
          return true;
        }
        localStorage.removeItem(PREVIEW_KEY);
      }
    }
    return false;
  } catch {
    return false;
  }
}

function checkOwnerBypass(): boolean {
  try {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dfe_owner") === "brittany8888") {
        localStorage.setItem(OWNER_KEY, "true");
        window.history.replaceState({}, "", window.location.pathname);
        return true;
      }
    }
    return localStorage.getItem(OWNER_KEY) === "true";
  } catch {
    return false;
  }
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return checkOwnerBypass() || checkPreviewAccess() || localStorage.getItem(STORAGE_KEY) === "true";
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
          setIsLoading(false);
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

    if (checkOwnerBypass() || checkPreviewAccess()) {
      setIsPremium(true);
      setIsLoading(false);
    } else if (isInWebView()) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: "CHECK_SUBSCRIPTION" })
      );
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("message", handleMessage);
      };
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
    } else {
      window.open("https://apps.apple.com/app/id6759208291", "_blank");
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPremium, isLoading, subscribe, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const FREE_DECODED_CHAPTERS = 0;
export const FREE_PODCAST_EPISODES = 0;
