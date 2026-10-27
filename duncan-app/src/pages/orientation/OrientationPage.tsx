import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Typography } from "antd";

import { useOrientation } from "../../app/layouts/hooks/useOrientation";

import styles from "./OrientationPage.module.css";

const { Title, Text } = Typography;

export function OrientationPage() {
  const { isLandscape } = useOrientation();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from && location.state.from !== "/orientation"
      ? location.state.from
      : "/";

  useEffect(() => {
    if (isLandscape) {
      navigate(from, { replace: true });
    }
  }, [isLandscape, from, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.grid} />

      <div className={styles.content}>
        <div className={styles.phoneIcon}>
          <div className={styles.phone} />
        </div>

        <Title level={2} className={styles.title}>
          Please Rotate Your Device
        </Title>

        <Text className={styles.description}>
          This platform is designed for landscape mode.
        </Text>
      </div>
    </div>
  );
}
