import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  refetchCurrentUser,
  setSessionLocation,
  useSession,
  clearCurrentUser,
  getSessionStore,
  navigate,
} from "@openmrs/esm-framework";
import { getProvider } from "../login.resource";
import { extractErrorMessagesFromResponse } from "../utils";
export interface LoginReferrer {
  referrer?: string;
}

const Login: React.FC<LoginReferrer> = () => {
  const { provider: loginProvider } = useConfig<ConfigSchema>();
  const isLoginEnabled = useConnectivity();
  const { t } = useTranslation();
  const { user } = useSession();
  const nav = useNavigate();
  const [state, setState] = useState({
    username: "",
    password: "",
    errorMessage: "",
    isLoggingIn: false,
  });
  const { username, password, errorMessage, isLoggingIn } = state;
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (user) {
      clearCurrentUser();
      refetchCurrentUser().then(() => {
        const authenticated =
          getSessionStore()?.getState()?.session?.authenticated;
        if (
          authenticated &&
          getSessionStore()?.getState()?.session?.sessionLocation?.uuid !== null
        ) {
          // nav("/home"); // fix this
          navigate({ to: "${openmrsSpaBase}/home" });
          window.location.href = `${window.getOpenmrsSpaBase()}home`;
        }
      });
    } else if (!username && location?.pathname === "/login/confirm") {
      // nav("/login"); // fix this
      navigate({ to: "/login" });
    }
  }, [username, user, nav]);

  const handleChange = useCallback(
    (field: "username" | "password") =>
      (evt: React.ChangeEvent<HTMLInputElement>) => {
        setState((prevState) => ({
          ...prevState,
          [field]: evt.target.value,
        }));
      },
    []
  );

  const resetUserNameAndPassword = useCallback(() => {
    setState({
      username: "",
      password: "",
      errorMessage: "",
      isLoggingIn: false,
    });
  }, []);

  const handleSubmit = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      try {
        setState((prevState) => ({
          ...prevState,
          isLoggingIn: true,
        }));
        const sessionStore = await refetchCurrentUser(username, password);
        getProvider(sessionStore?.session?.user?.uuid, username, password).then(
          (res) => {
            const locationAttr = res?.data?.results[0]?.attributes?.find(
              (x) =>
                x?.attributeType?.uuid ===
                "13a721e4-68e5-4f7a-8aee-3cbcec127179"
            )?.value?.uuid;

            setSessionLocation(locationAttr, new AbortController());
            window.location.href = `${window.getOpenmrsSpaBase()}home`;
            resetUserNameAndPassword();
          },
          (error) => {
            const err = extractErrorMessagesFromResponse(error);
            setState((prevState) => ({
              ...prevState,
              errorMessage: err.join(","),
            }));
            resetUserNameAndPassword();
          }
        );
      } catch (error) {
        const err = extractErrorMessagesFromResponse(error);
        setState((prevState) => ({
          ...prevState,
          errorMessage: err.join(",") || error.message,
        }));
        resetUserNameAndPassword();
      } finally {
        setState((prevState) => ({
          ...prevState,
          isLoggingIn: false,
        }));
      }

      return true;
    },
    [username, password, resetUserNameAndPassword]
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
                subtitle={t(errorMessage)}
                title={t("error", "Error")}
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
                    onChange={handleChange("username")}
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
                    onChange={handleChange("password")}
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
