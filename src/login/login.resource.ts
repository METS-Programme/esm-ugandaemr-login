import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";
import useSWR from "swr";
export const sessionURL = `/ws/rest/v1/session`;

// Logout if default location is missing
export async function logoutIfNoCredentials(
  sessionUrl: string,
  abortController: AbortController
) {
  await openmrsFetch(sessionURL, {
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

  return await openmrsFetch(sessionURL, {
    headers: {
      Authorization: `Basic ${token}`,
    },
    signal: abortController.signal,
  });
}

export async function getProvider(userUUID: string, token: string) {
  const abortController = new AbortController();
  const providerUrl = `${restBaseUrl}/provider?user=${userUUID}&v=full`;

  return openmrsFetch(providerUrl, {
    headers: {
      Authorization: `Basic ${token}`,
    },
    signal: abortController.signal,
  });
}

export function useFacilityName() {
  const apiURL = `${restBaseUrl}/ugandaemr/gp?property=ugandaemr.healthCenterName`;

  const { data, error, isLoading } = useSWR<{ data }, Error>(
    apiURL,
    openmrsFetch
  );
  const facilityName = data?.data?.value ?? "";

  return {
    facilityName,
    isLoading,
    isError: error,
  };
}
