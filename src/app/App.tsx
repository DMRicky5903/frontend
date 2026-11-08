// src/app/App.tsx
import { RouterProvider } from "react-router";
import { ConfigProvider, theme } from "antd";

import { WebSocketProvider } from "../api/WebSocketProvider";
import { router } from "./router";

import "../index.css";

const websocketUrl =
  import.meta.env.VITE_WS_URL ?? "ws://localhost:8080/ws";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#22d3ee",
          colorBgBase: "#05070d",
          borderRadius: 10,
        },
      }}
    >
      <WebSocketProvider url={websocketUrl}>
        <RouterProvider router={router} />
      </WebSocketProvider>
    </ConfigProvider>
  );
}
