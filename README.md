# Duncan App Frontend

Duncan App Frontend 是一個以 React、TypeScript 與 Vite 建立的機器人遠端控制介面。它提供聊天互動、機器人狀態監控、攝影機畫面、遙控操作，以及 SLAM 地圖與雷達資訊顯示。

## 功能

- **聊天介面**：提供訊息輸入、訊息列表與訊息氣泡顯示，並透過 WebSocket 與後端服務通訊。
- **機器人控制**：包含虛擬搖桿、鍵盤操控、狀態燈號與遠端控制頁面。
- **視覺資訊**：顯示攝影機畫面、SLAM 地圖疊層與雷達迷你地圖。
- **權限控制**：依使用者權限決定可用的控制功能。
- **響應式介面**：針對不同裝置方向與螢幕尺寸提供對應的版面與操作體驗。

## 技術架構

- React
- TypeScript
- Vite
- React Router
- WebSocket
- CSS Modules
- Oxlint

## 專案結構

```text
src/
├── api/                 # WebSocket、API 類型與權限相關邏輯
├── app/                 # 應用程式進入點、路由與版面配置
├── features/
│   ├── chat/            # 聊天功能
│   └── robot-control/   # 機器人控制、攝影機與 SLAM 顯示
└── pages/               # 頁面層級元件
