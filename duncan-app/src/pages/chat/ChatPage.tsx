import { Typography } from "antd";

import styles from "./ChatPage.module.css";

const { Title, Text } = Typography;

export function ChatPage() {
  return (
    <div className={styles.page}>
      <Title level={3} className={styles.title}>
        Chat
      </Title>

      <div className={styles.placeholder}>
        <Text type="secondary">
          Chat interface will be connected later.
        </Text>
      </div>
    </div>
  );
}
