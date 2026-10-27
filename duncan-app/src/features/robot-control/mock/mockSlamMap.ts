import type {
  SlamMapMessage,
  SlamPoseMessage,
} from "../../../api/type";

// =========================================================
// 測試用假 SLAM 地圖
//
// 測試完成後：
// 1. 刪除整個 mock 資料夾
// 2. 刪除 useSlamMap.ts 中的 USE_MOCK_SLAM_MAP 相關程式
// =========================================================

export const USE_MOCK_SLAM_MAP = true;

export const MOCK_SLAM_MAP: SlamMapMessage = {
  type: "slamMap",
  image: "/mock-slam-map.png",
  resolution: 0.05,
  origin: {
    x: -15,
    y: -8,
  },
};

export const MOCK_SLAM_POSE: SlamPoseMessage = {
  type: "slamPose",
  x: -1,
  y: -1,
  yaw: 0,
};
