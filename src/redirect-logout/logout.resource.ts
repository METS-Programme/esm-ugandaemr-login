import {
  clearCurrentUser,
  openmrsFetch,
  refetchCurrentUser,
} from "@openmrs/esm-framework";
import { mutate } from "swr";
import { sessionEndpoint } from "@openmrs/esm-api/src/openmrs-fetch";

export async function performLogout() {
  await openmrsFetch(sessionEndpoint, {
    method: "DELETE",
  });

  await mutate(() => true, undefined, { revalidate: false });

  clearCurrentUser();
  await refetchCurrentUser();
}
