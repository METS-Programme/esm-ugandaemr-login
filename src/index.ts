import { getAsyncLifecycle, defineConfigSchema } from "@openmrs/esm-framework";
import {  configSchema } from "./config-schema";

const moduleName = "@ugandaemr/esm-login-app";

const options = {
  featureName: "login",
  moduleName,
};

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(
  () => import("./root.component"),
  options
);

export const logoutButton = getAsyncLifecycle(
  () => import("./logout/logout.component"),
  options
);
