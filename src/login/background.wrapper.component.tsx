import React from "react";
import styles from "./login.scss";
import { useConfig } from "@openmrs/esm-framework";
const BackgroundWrapper = ({ children }) => {
  const config = useConfig();

  return config?.loginBackgroundImage ? (
    <div className={styles.backgroundContainer}>
      <img
        src={config?.loginBackgroundImage?.src}
        alt={config?.loginBackgroundImage?.alt}
        className={styles.backgroundImage}
      />
      <div className={styles.contentOverlay}>{children}</div>
    </div>
  ) : (
    <div className={styles.backgroundContainer}>
      <img
        src={"/assets/background.png"}
        alt={config?.loginBackgroundImage?.alt}
        className={styles.backgroundImage}
      />
      <div className={styles.contentOverlay}>{children}</div>
    </div>
  );
};

export default BackgroundWrapper;
