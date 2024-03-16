import React, { useEffect } from "react";
import {
  clearCurrentUser,
  getSessionStore,
  navigate,
  refetchCurrentUser,
  useConfig,
  useSession,
} from "@openmrs/esm-framework";

export interface LoginReferrer {
  referrer?: string;
}

const ConfirmLocation: React.FC<LoginReferrer> = () => {
  const config = useConfig();
  const { user } = useSession();

  useEffect(() => {
    if (user) {
      clearCurrentUser();
      refetchCurrentUser().then(() => {
        const authenticated =
          getSessionStore().getState().session.authenticated;
        if (authenticated) {
          navigate({ to: config.links.loginSuccess });
        }
      });
    }
  }, [config.links.loginSuccess, user]);

  return null;
};

export default ConfirmLocation;
