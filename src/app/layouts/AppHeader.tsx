import { Link, Outlet } from "react-router";
import { Layout, Typography } from "antd";
import { RadarChartOutlined } from "@ant-design/icons";

import styles from "./AppHeader.module.css";

const { Header, Content } = Layout;

export function AppHeader() {
  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.topLine} />

        <Link to="/" className={styles.brand}>
          <div className={styles.logoMark}>
            <RadarChartOutlined className={styles.logoIcon} />
            <div className={styles.logoGlow} />
          </div>

          <div className={styles.brandText}>
            <Typography.Title level={4} className={styles.logoTitle}>
              Duncan
            </Typography.Title>

            <span className={styles.logoSubtitle}>
              Intelligent Control Platform
            </span>
          </div>
        </Link>

        <div className={styles.headerRight}>
          <div className={styles.systemTag}>
            <span className={styles.statusDot} />
            SYSTEM ONLINE
          </div>
        </div>
      </Header>

      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}
