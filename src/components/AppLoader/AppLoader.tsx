// src/components/AppLoader/AppLoader.tsx
import "./AppLoader.css";

interface AppLoaderProps {
  message?: string;
}

export function AppLoader({ message = "Chargement..." }: AppLoaderProps) {
  return (
    <div className="app-loader-container">
      <div className="app-loader-spinner" />
      <span className="app-loader-text">{message}</span>
    </div>
  );
}
