import { Link } from "react-router";
import { Typography } from "antd";
import {
  ApiOutlined,
  MessageOutlined,
} from "@ant-design/icons";

import styles from "./HomePage.module.css";

const { Title, Text } = Typography;

export function HomePage() {
  return (
    <div className={styles.page}>
      {/* 全域細網格 */}
      <div className={styles.gridBackground} />

      {/* 左側：AI Chat */}
      <Link to="/chat" className={`${styles.panel} ${styles.chatPanel}`}>
        <div className={styles.chatDecor}>
          <div className={styles.chatRing} />
          <div className={styles.chatRingSmall} />
          <div className={styles.chatScanline} />
        </div>

        <div className={styles.panelGlow} />

        <div className={styles.chatContent}>
          <div className={styles.iconShell}>
            <MessageOutlined className={styles.icon} />
          </div>

          <Title level={2} className={styles.panelTitle}>
            AI Chat
          </Title>

          <Text className={styles.panelDescription}>
            Converse with your intelligent assistant
          </Text>

          <span className={styles.panelHint}>
            Enter Chat
          </span>
        </div>
      </Link>

      {/* 右側：Remote Control */}
      <Link to="/remote" className={`${styles.panel} ${styles.remotePanel}`}>
        <div className={styles.remoteDecor}>
          <div className={styles.remoteRing} />
          <div className={styles.remoteRingSmall} />
          <div className={styles.remoteScanline} />
        </div>

        <div className={styles.panelGlow} />

        <div className={styles.remoteContent}>
          <div className={styles.iconShell}>
            <ApiOutlined className={styles.icon} />
          </div>

          <Title level={2} className={styles.panelTitle}>
            Remote Control
          </Title>

          <Text className={styles.panelDescription}>
            Control and monitor connected devices
          </Text>

          <span className={styles.panelHint}>
            Enter Remote
          </span>
        </div>
      </Link>

      {/* 斜切光線 */}
      <div className={styles.diagonalLine} />
    </div>
  );
}
