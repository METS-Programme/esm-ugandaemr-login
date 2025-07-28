import { SwitcherItem, Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "./change-location-link.scss";
import { WatsonHealthImageAvailabilityLocal } from "@carbon/react/icons";
import { showModal } from "@openmrs/esm-framework";

const ChangeLocationLink: React.FC = () => {
  const { t } = useTranslation();

  const launchChangeLocationModal = useCallback(() => {
    const dispose = showModal("change-location-modal", {
      closeModal: () => dispose(),
      size: "sm",
    });
  }, []);

  return (
    <SwitcherItem
      aria-label={t("changeLocation", "ChangeLocation")}
      className={styles.panelItemContainer}
    >
      <div>
        <WatsonHealthImageAvailabilityLocal size={20} />
        <p>{t("location", "Location")}</p>
      </div>
      <Button kind="ghost" onClick={launchChangeLocationModal}>
        {t("change", "Change")}
      </Button>
    </SwitcherItem>
  );
};

export default ChangeLocationLink;
