import { Link } from "react-router";
import { Typography } from "antd";

import styles from "./HomePage.module.css";

const { Title, Text } = Typography;

export function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.gridBackground} />

      <Link to="/chat" className={`${styles.panel} ${styles.chatPanel}`}>
        <div className={styles.panelGlow} />

        <div className={styles.panelContent}>
          <div className={styles.icon}>💬</div>

          <Title level={2} className={styles.panelTitle}>
            Chat
          </Title>

          <Text className={styles.panelDescription}>
            Open the intelligent chat interface
          </Text>

          <span className={styles.panelAction}>Enter Chat →</span>
        </div>
      </Link>

      <Link
        to="/remote"
        className={`${styles.panel} ${styles.remotePanel}`}
      >
        <div className={styles.panelGlow} />

        <div className={styles.panelContent}>
          <div className={styles.icon}>🎮</div>

          <Title level={2} className={styles.panelTitle}>
            Remote Control
          </Title>

          <Text className={styles.panelDescription}>
            Operate the system with dual joysticks
          </Text>

          <span className={styles.panelAction}>Enter Remote →</span>
        </div>
      </Link>

      <div className={styles.centerLine} />
    </div>
  );
}
