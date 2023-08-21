import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Switcher, SwitcherDivider } from "@carbon/react";
import { navigate } from "@openmrs/esm-framework";
import styles from "./logout.scss";

const Logout: React.FC = () => {
  const { t } = useTranslation();
  const logout = useCallback(() => {
    navigate({ to: "${openmrsSpaBase}/logout" });
  }, []);

  return (
    <>
      <SwitcherDivider className={styles.divider} />
      <Switcher aria-label="Switcher Container">
        <Button
          className={styles.logout}
          onClick={logout}
          aria-labelledby="Logout"
          role="button"
        >
          {t("Logout", "Logout")}
        </Button>
      </Switcher>
    </>
  );
};

export default Logout;
