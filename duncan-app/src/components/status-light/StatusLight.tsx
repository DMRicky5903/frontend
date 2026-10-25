import styles from "./StatusLight.module.css";

type StatusLightProps = {
  locked: boolean;
};

export function StatusLight({ locked }: StatusLightProps) {
  return (
    <div
      className={`${styles.light} ${
        locked ? styles.red : styles.green
      }`}
    />
  );
}
