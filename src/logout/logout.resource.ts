import {
  clearCurrentUser,
  openmrsFetch,
  refetchCurrentUser,
} from "@openmrs/esm-framework";
import { mutate } from "swr";
import { sessionURL } from "../login/login.resource";

export async function performLogout() {
  await openmrsFetch(sessionURL, {
    method: "DELETE",
  });

  await mutate(() => true, undefined, { revalidate: false });

  clearCurrentUser();
  await refetchCurrentUser();
}
