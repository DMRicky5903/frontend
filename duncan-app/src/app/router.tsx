import { createBrowserRouter } from "react-router";

import { AppHeader } from "./layouts//AppHeader";
import { RequireLandscapeOutlet } from "./layouts/RequireLandscapeOutlet";

import { HomePage } from "../pages/home/HomePage";
import { ChatPage } from "../pages/chat/ChatPage";
import { RemotePage } from "../pages/remote/RemotePage";
import { OrientationPage } from "../pages/orientation/OrientationPage";
import { NotFoundPage } from "../pages/not-found/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/orientation",
    element: <OrientationPage />,
  },
  {
    path: "/",
    element: <AppHeader />,
    children: [
      {
        element: <RequireLandscapeOutlet />,
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
    ],
  },
]);
