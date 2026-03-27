import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { isSupabaseConfigured } from "./lib/supabase.ts";

// Pre-flight check for production environment
if (import.meta.env.PROD && !isSupabaseConfigured) {
  console.warn(
    "[SkillUp Buddy] Warning: Supabase environment variables are missing in production.\n" +
    "Authentication and data features will be limited."
  );
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
