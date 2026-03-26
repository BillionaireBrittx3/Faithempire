import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initReminders } from "@/lib/prayer-reminder";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

initReminders();

createRoot(document.getElementById("root")!).render(<App />);
