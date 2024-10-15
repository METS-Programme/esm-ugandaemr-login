import React from "react";
import styles from "./login.scss";
import { useConfig } from "@openmrs/esm-framework";
const BackgroundWrapper = ({ children }) => {
  const config = useConfig();

  return config?.loginBackgroundImage ? (
    <>
      <img
        src={config?.loginBackgroundImage?.src}
        alt={config?.loginBackgroundImage?.alt || "Background Image"}
        className={styles.backgroundImage}
      />
      <div className={styles.backgroundContainer}>
        <div className={styles.contentOverlay}>{children}</div>
      </div>
    </>
  ) : (
    <>
      <img
        src="/openmrs/spa/background.png"
        alt="Fallback Background"
        className={styles.backgroundImage}
      />
      <div className={styles.backgroundContainer}>
        <div className={styles.contentOverlay}>{children}</div>
      </div>
    </>
  );
};

export default BackgroundWrapper;
