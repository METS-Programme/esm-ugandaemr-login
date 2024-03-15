import { openmrsFetch } from "@openmrs/esm-framework";

// Logout if default location is missing
export async function logoutIfNoCredentials(
  sessionUrl: string,
  abortController: AbortController
) {
  await openmrsFetch(sessionUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });

  throw new Error("Invalid Credentials");
}

export async function performLogin(token: string) {
  const abortController = new AbortController();
  const sessionUrl = `/ws/rest/v1/session`;

  return await openmrsFetch(sessionUrl, {
    headers: {
      Authorization: `Basic ${token}`,
    },
    signal: abortController.signal,
  });
}

export async function getProvider(userUUID: string, token: string) {
  const abortController = new AbortController();
  const providerUrl = `/ws/rest/v1/provider?user=${userUUID}&v=full`;

  return openmrsFetch(providerUrl, {
    headers: {
      Authorization: `Basic ${token}`,
    },
    signal: abortController.signal,
  });
}
