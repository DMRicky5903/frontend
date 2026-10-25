import { Link, Outlet } from "react-router";
import { Layout, Typography } from "antd";

import styles from "./AppHeader.module.css";

const { Header, Content } = Layout;

export function AppHeader() {
  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoMark}>
            <span className={styles.logoIcon}>🛰️</span>
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
          <span className={styles.systemTag}>SYSTEM ONLINE</span>
        </div>
      </Header>

      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}
