import React from "react";
import styles from "./login.scss";
import { useConfig } from "@openmrs/esm-framework";
const BackgroundWrapper = ({ children }) => {
  const config = useConfig();

  return config?.showCenteredLogin ? (
    <>
      <div className={styles.centeredLoginBackgroundContainer}>
        <div
          style={{ backgroundImage: `url(${config?.loginBackground?.src})` }}
          className={styles.centeredLoginOverlay}
        ></div>
        <div className={styles.contentOverlay}>{children}</div>
      </div>
    </>
  ) : (
    <>
      <img
        src={config?.loginBackground?.src ?? "/openmrs/spa/background.png"}
        alt={config?.loginBackground?.alt || "Background Image"}
        className={styles.backgroundImage}
      />
      <div className={styles.backgroundContainer}>
        <div className={styles.contentOverlay}>{children}</div>
      </div>
    </>
  );
};

export default BackgroundWrapper;
