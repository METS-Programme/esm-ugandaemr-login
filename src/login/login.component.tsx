import React, { useCallback, useEffect, useRef, useState } from "react";
import { type To, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  InlineLoading,
  InlineNotification,
  PasswordInput,
  TextInput,
  Tile,
} from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";

import Logo from "./logo.component";
import styles from "./login.scss";
import { ConfigSchema } from "../config-schema";
import {
  useConfig,
  useConnectivity,
  useSession,
  refetchCurrentUser,
  navigate as openmrsNavigate,
  clearCurrentUser,
  getSessionStore,
} from "@openmrs/esm-framework";
import { performLogin } from "../login.resource";
export interface LoginReferrer {
  referrer?: string;
}

const Login: React.FC<LoginReferrer> = () => {
  const { provider: loginProvider, links: loginLinks } =
    useConfig<ConfigSchema>();
  const isLoginEnabled = useConnectivity();
  const { t } = useTranslation();
  const { user } = useSession();
  const location = useLocation() as unknown as Omit<Location, "state"> & {
    state: LoginReferrer;
  };

  const rawNavigate = useNavigate();
  const navigate = useCallback(
    (to: To) => {
      rawNavigate(to, { state: location.state });
    },
    [rawNavigate, location.state]
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (user) {
      clearCurrentUser();
      refetchCurrentUser().then(() => {
        const authenticated =
          getSessionStore().getState().session.authenticated;
        if (
          authenticated &&
          getSessionStore()?.getState()?.session?.sessionLocation?.uuid !== null
        ) {
          navigate("/home");
        }
      });
    } else if (!username && location?.pathname === "/login/confirm") {
      navigate("/login");
    }
  }, [username, navigate, location, user]);

  const changeUsername = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setUsername(evt.target.value),
    []
  );

  const changePassword = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setPassword(evt.target.value),
    []
  );

  const resetUserNameAndPassword = useCallback(() => {
    setUsername("");
    setPassword("");
  }, []);

  const handleSubmit = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      try {
        setIsLoggingIn(true);
        const sessionStore = await refetchCurrentUser(username, password);
        const session = sessionStore?.session;
        await performLogin(session.user?.uuid, username, password);
        navigate(loginLinks.loginSuccess);
      } catch (error) {
        setErrorMessage(error.message);
        resetUserNameAndPassword();
      } finally {
        setIsLoggingIn(false);
      }

      return false;
    },

    [
      username,
      password,
      navigate,
      loginLinks.loginSuccess,
      resetUserNameAndPassword,
    ]
  );

  if (!loginProvider || loginProvider?.type === "basic") {
    return (
      <div className={`canvas ${styles["container"]}`}>
        <div className={styles.section}>
          <Tile className={styles["login-card"]}>
            <Logo className={styles.logo} />
            {errorMessage && (
              <InlineNotification
                className={styles.errorMessage}
                kind="error"
                /**
                 * This comment tells i18n to still keep the following translation keys (used as value for: errorMessage):
                 * t('invalidCredentials')
                 */
                subtitle={t(errorMessage)}
                title={t("error", "Error")}
                onClick={() => setErrorMessage("")}
              />
            )}
            <form onSubmit={handleSubmit} ref={formRef}>
              <div className={styles["input-group"]}>
                <div className={styles["input-container"]}>
                  <TextInput
                    id="username"
                    type="text"
                    name="username"
                    labelText={t("username", "Username")}
                    value={username}
                    onChange={changeUsername}
                    ref={usernameInputRef}
                    autoFocus
                    required
                  />
                </div>
                <div style={{ marginTop: "1rem" }} />
                <div className={styles["input-group"]}>
                  <PasswordInput
                    id="password"
                    invalidText={t(
                      "validValueRequired",
                      "A valid value is required"
                    )}
                    labelText={t("password", "Password")}
                    name="password"
                    value={password}
                    onChange={changePassword}
                    ref={passwordInputRef}
                    required
                    showPasswordLabel="Show password"
                  />
                </div>

                <div>
                  <div>
                    <Button
                      type="submit"
                      className={styles.continueButton}
                      renderIcon={(props) => (
                        <ArrowRight size={24} {...props} />
                      )}
                      iconDescription="Log in"
                      disabled={!isLoginEnabled || isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <InlineLoading
                          className={styles.loader}
                          description={t("loggingIn", "Logging in") + "..."}
                        />
                      ) : (
                        <span>Log in</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Tile>
          <div className={styles.footer}>
            <div className={styles.links}>
              <span>© {new Date().getFullYear()} All rights reserved</span>
              <span className={styles.link}>
                <a href="http://www.health.go.ug/">
                  Ministry of Health - Republic of Uganda
                </a>
              </span>
            </div>
            <span className={styles.link}>
              Need help? Contact us at{" "}
              <a href="mailto:emrtalk@musph.ac.ug">emrtalk@musph.ac.ug</a> for
              support
            </span>
            <div className={styles.attribution}>
              <span className={styles["powered-by-txt"]}>Powered by</span>
              <svg role="img" className={styles["powered-by-logo"]}>
                <use xlinkHref="#omrs-logo-partial-mono"></use>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Login;
