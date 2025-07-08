import {
  getAsyncLifecycle,
  defineConfigSchema,
  getSyncLifecycle,
} from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import changePasswordLinkComponent from "./change-password/change-password-link.extension";
import changeLocationLinkComponent from "./change-location/change-location-link.extension";

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

export const changePasswordLink = getSyncLifecycle(
  changePasswordLinkComponent,
  options
);
export const changePasswordModal = getAsyncLifecycle(
  () => import("./change-password/change-password.modal"),
  options
);

export const changeLocationLink = getSyncLifecycle(
  changeLocationLinkComponent,
  options
);

export const changeLocationModal = getAsyncLifecycle(
  () => import("./change-location/change-location-modal"),
  options
);
