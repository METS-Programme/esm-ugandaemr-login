import React, { useEffect } from "react";
import {
  navigate,
  useConfig,
  useConnectivity,
  useSession,
} from "@openmrs/esm-framework";
import { performLogout } from "../logout/logout.resource";

const RedirectLogout: React.FC = () => {
  const config = useConfig();
  const session = useSession();
  const isLoginEnabled = useConnectivity();

  useEffect(() => {
    if (!session.authenticated || !isLoginEnabled) {
      navigate({ to: "${openmrsSpaBase}/login" });
    } else {
      performLogout().then(() => {
        if (config.provider.type === "oauth2") {
          location.href = config.provider.logoutUrl;
        } else {
          navigate({ to: "${openmrsSpaBase}/login" });
        }
      });
    }
  }, [isLoginEnabled, session, config]);

  return null;
};

export default RedirectLogout;
