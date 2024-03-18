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
  navigate,
  refetchCurrentUser,
  setSessionLocation,
  useConfig,
  useConnectivity,
} from "@openmrs/esm-framework";
import { getProvider, performLogin, useFacilityName } from "./login.resource";
import Logo from "./logo.component";
import styles from "./login.scss";

export interface LoginReferrer {
  referrer?: string;
}

const Login: React.FC<LoginReferrer> = () => {
  const config = useConfig();
  const isLoginEnabled = useConnectivity();
  const { t } = useTranslation();
  const location = useLocation();
  const nav = useNavigate();
  const { facilityName } = useFacilityName();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  useEffect(() => {
    if (hasUserLocation) {
      clearCurrentUser();
      refetchCurrentUser().then(() => {
        const authenticated =
          getSessionStore().getState().session.authenticated;
        if (authenticated) {
          navigate({ to: config.links.loginSuccess });
        }
      });
    } else if (!username && location.pathname === "/login/confirm") {
      nav("/login", { state: location.state });
    }
  }, [username, nav, location, hasUserLocation, config.links.loginSuccess]);

  const changeUsername = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setUsername(evt.target.value),
    []
  );

  const changePassword = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setPassword(evt.target.value),
    []
  );

  const handleSubmit = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      setIsLoggingIn(true);
      const token = window.btoa(`${username}:${password}`);
      performLogin(token).then(
        (loginResponse) => {
          if (
            loginResponse.status === 200 &&
            loginResponse?.data?.authenticated
          ) {
            const userUUID = loginResponse.data?.user?.uuid;
            getProvider(userUUID, token).then(
              async (providerResponse) => {
                if (providerResponse.status === 200) {
                  const userLocationUuid =
                    providerResponse?.data?.results[0]?.attributes.find(
                      (provider: any) =>
                        provider.attributeType?.uuid ===
                        config.provider.attributeTypeUUID
                    )?.value?.uuid;
                  setIsLoggingIn(false);
                  setHasUserLocation(true);

                  await setSessionLocation(
                    userLocationUuid,
                    new AbortController()
                  );
                }
              },
              (error) => {
                setIsLoggingIn(false);
                setErrorMessage(error?.message);
              }
            );
          } else {
            setIsLoggingIn(false);
            setErrorMessage("Invalid Credentials");
          }
        },
        (error) => {
          setIsLoggingIn(false);
          setErrorMessage(error?.message);
        }
      );
    },
    [config.provider.attributeTypeUUID, password, username]
  );

  if (config.provider.type === "basic") {
    return (
      <div className={`canvas ${styles["container"]}`}>
        <div className={styles.section}>
          <div className={styles.logoContainer}>
            <Logo className={styles.logo} />
          </div>
          <Tile className={styles["login-card"]}>
            <div className={styles.facilityNameContainer}>{facilityName}</div>
            {errorMessage && (
              <InlineNotification
                className={styles.errorMessage}
                kind="error"
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
              <span className={styles.link}>
                © {new Date().getFullYear()} All rights reserved
              </span>
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
            <span className={styles.link}>
              Go to <a href={`/openmrs/login.htm`}> Legacy UI</a>
            </span>
            <div className={styles.attribution}>
              <span className={styles["powered-by-txt"]}>
                {t("poweredBy", "Powered by")}
              </span>
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
