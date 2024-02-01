import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  clearCurrentUser,
  getSessionStore,
  interpolateUrl,
  navigate,
  refetchCurrentUser,
  useConfig,
  useConnectivity,
  useSession,
} from "@openmrs/esm-framework";
import { performLogin } from "../login.resource";
import Logo from "./logo.component";
import styles from "./login.scss";

export interface LoginReferrer {
  referrer?: string;
}

const Login: React.FC<LoginReferrer> = () => {
  const config = useConfig();
  const isLoginEnabled = useConnectivity();
  const { t } = useTranslation();
  const { user } = useSession();
  const location = useLocation();
  const nav = useNavigate();
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
        if (authenticated) {
          nav("/home", { state: location.state });
        }
      });
    } else if (!username && location.pathname === "/login/confirm") {
      nav("/login", { state: location.state });
    }
  }, [username, nav, location, user]);

  useEffect(() => {
    if (!user && config.provider.type === "oauth2") {
      const loginUrl = config.provider.loginUrl;
      window.location.href = loginUrl;
    }
  }, [config, user]);

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
        await performLogin(username, password);
        navigate({ to: config.links.loginSuccess });
      } catch (error) {
        setErrorMessage(error.message);
        resetUserNameAndPassword();
      } finally {
        setIsLoggingIn(false);
      }

      return false;
    },

    [username, password, config.links.loginSuccess, resetUserNameAndPassword]
  );

  const logo = config.logo.src ? (
    <img
      src={interpolateUrl(config.logo.src)}
      alt={config.logo.alt}
      className={styles["logo-img"]}
    />
  ) : (
    <svg role="img" className={styles["logo"]}>
      <title>OpenMRS logo</title>
      <use xlinkHref="#omrs-logo-full-color"></use>
    </svg>
  );

  if (config.provider.type === "basic") {
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
                        <span>{t("login", "Log in")}</span>
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
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Login;
