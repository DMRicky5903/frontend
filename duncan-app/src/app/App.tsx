import { RouterProvider } from "react-router";
import { ConfigProvider, theme } from "antd";

import { router } from "./router";

import "../index.css";

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
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
