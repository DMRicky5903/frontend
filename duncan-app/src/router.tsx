import { createBrowserRouter } from "react-router";

import { AppHeader } from "./components/layout/AppHeader";
import { HomePage } from "./pages/home/HomePage";
import { ChatPage } from "./pages/chat/ChatPage";
import { RemotePage } from "./pages/remote/RemotePage";
import { NotFoundPage } from "./pages/not-found/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppHeader />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "remote",
        element: <RemotePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
