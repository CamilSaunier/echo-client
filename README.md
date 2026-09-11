# 💻 Echo Client

A small, lightweight front-end side project built with **React** and **TypeScript** to explore and understand real-time instant messaging using WebSockets.

## 🛠️ Tech Stack

- **Framework:** React 19 & TypeScript (Bundled with Vite)
- **Routing:** React Router DOM (Protected & Public layout structure)
- **State Management:** Zustand (Stores for Auth, Chat, and Friends)
- **Real-Time:** `socket.io-client` (Singleton pattern implementation)
- **Styling & Feedback:** Modular CSS, Lucide React (Icons), and Sonner (Toasts)
- **Package Manager:** pnpm

## 🌟 Key Features

- **Secure Session Handling:** Access tokens are kept strictly in RAM via Zustand to mitigate XSS vulnerabilities, paired with a silent token refresh mechanism using HttpOnly cookies on app initialization (`checkAuth`).
- **Real-Time WebSockets:** Automatic socket handshake using the current authentication token, with clean connection lifecycle management (connect/disconnect on login/logout).
- **Protected & Public Routing:** Route guards enforcing authentication checks via `AppLoader` before rendering dashboard layouts.

## 📂 Project Structure

```text
src/
├── components/    # Modular UI components (ChatArea, Sidebar, FriendsManager, Auth, etc.)
├── hooks/         # Custom React hooks (e.g., useTheme)
├── pages/         # Main application views (AuthPage, DashboardPage)
├── services/      # API services & Socket.io singleton client service
├── stores/        # Zustand state stores (auth.stores.ts, chat.store.ts, friend.store.ts)
├── types/         # Strict TypeScript definitions (API, Auth, Messages, Users)
└── utils/         # Helper functions
```
