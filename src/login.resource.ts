import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useSwrInfinite from "swr/infinite";
import {
  FetchResponse,
  fhirBaseUrl,
  openmrsFetch,
  restBaseUrl,
  setSessionLocation,
  showNotification,
} from "@openmrs/esm-framework";
import {
  hasAttribute,
  type LocationEntry,
  type LocationResponse,
  type ProviderResponse,
} from "./types";

// Logout if default location is missing
async function logoutIfNoCredentials(
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

export async function performLogin(
  uuid: string,
  username: string,
  password: string
): Promise<void> {
  const abortController = new AbortController();
  const token = window.btoa(`${username}:${password}`);
  const sessionUrl = `${restBaseUrl}/session`;

  const providerUrl = `${restBaseUrl}/provider?user=${uuid}&v=custom:(uuid,attributes:(uuid,attributeType:(uuid,display),value:(uuid,name)))`;

  const providerResponse: FetchResponse<ProviderResponse> = await openmrsFetch(
    providerUrl,
    {
      headers: {
        Authorization: `Basic ${token}`,
      },
      signal: abortController.signal,
    }
  );

  if (!hasAttribute(providerResponse.data)) {
    await logoutIfNoCredentials(sessionUrl, abortController);
  }

  const locationAttr = providerResponse?.data?.results[0]?.attributes?.find(
    (x) => x?.attributeType?.uuid === "13a721e4-68e5-4f7a-8aee-3cbcec127179"
  )?.value?.uuid;

  if (!locationAttr) {
    await logoutIfNoCredentials(sessionUrl, abortController);
  }

  await setSessionLocation(locationAttr, new AbortController());
}

interface LoginLocationData {
  locations: Array<LocationEntry>;
  isLoading: boolean;
  totalResults: number;
  hasMore: boolean;
  loadingNewData: boolean;
  setPage: (
    size: number | ((_size: number) => number)
  ) => Promise<FetchResponse<LocationResponse>[]>;
}

export function useLoginLocations(
  useLoginLocationTag: boolean,
  count = 0,
  searchQuery = ""
): LoginLocationData {
  const { t } = useTranslation();

  function constructUrl(page, prevPageData: FetchResponse<LocationResponse>) {
    if (
      prevPageData &&
      !prevPageData?.data?.link?.some((link) => link.relation === "next")
    ) {
      return null;
    }

    const url = `${fhirBaseUrl}/Location?`;
    const urlSearchParameters = new URLSearchParams();
    urlSearchParameters.append("_summary", "data");

    if (count) {
      urlSearchParameters.append("_count", "" + count);
    }

    if (page) {
      urlSearchParameters.append("_getpagesoffset", "" + page * count);
    }

    if (useLoginLocationTag) {
      urlSearchParameters.append("_tag", "Login Location");
    }

    if (typeof searchQuery === "string" && searchQuery != "") {
      urlSearchParameters.append("name:contains", searchQuery);
    }

    return url + urlSearchParameters.toString();
  }

  const { data, isLoading, isValidating, setSize, error } = useSwrInfinite<
    FetchResponse<LocationResponse>,
    Error
  >(constructUrl, openmrsFetch);

  if (error) {
    showNotification({
      title: t("errorLoadingLoginLocations", "Error loading login locations"),
      kind: "error",
      critical: true,
      description: error?.message,
    });
  }

  const memoizedLocations = useMemo(() => {
    return {
      locations: data?.length
        ? data?.flatMap((entries) => entries?.data?.entry ?? [])
        : null,
      isLoading,
      totalResults: data?.[0]?.data?.total ?? null,
      hasMore: data?.length
        ? data?.[data.length - 1]?.data?.link.some(
            (link) => link.relation === "next"
          )
        : false,
      loadingNewData: isValidating,
      setPage: setSize,
    };
  }, [isLoading, data, isValidating, setSize]);

  return memoizedLocations;
}
