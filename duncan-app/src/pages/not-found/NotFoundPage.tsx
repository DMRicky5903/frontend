import { useNavigate } from "react-router";
import { Button, Result, Typography } from "antd";
import { RadarChartOutlined } from "@ant-design/icons";

import styles from "./NotFoundPage.module.css";

const { Text } = Typography;

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.glow} />

      <div className={styles.content}>
        <Result
          className={styles.result}
          icon={
            <div className={styles.radar}>
              {/* 雷達網格 */}
              <div className={styles.radarGrid} />

              {/* 掃描扇形 */}
              <div className={styles.radarSweep} />

              {/* 脈衝環 */}
              <div className={styles.radarRing} />
              <div className={`${styles.radarRing} ${styles.radarRingDelay}`} />

              {/* 中央 icon */}
              <RadarChartOutlined className={styles.radarIcon} />
            </div>
          }
          title={<span className={styles.title}>404</span>}
          subTitle={
            <Text className={styles.subtitle}>
              Signal lost. The requested route does not exist.
            </Text>
          }
          extra={
            <div className={styles.actions}>
              <Button
                type="primary"
                size="large"
                className={styles.primaryButton}
                onClick={() => navigate("/")}
              >
                Back Home
              </Button>

              <Button
                size="large"
                className={styles.ghostButton}
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
