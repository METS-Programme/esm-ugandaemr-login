import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useSwrInfinite from "swr/infinite";
import {
  FetchResponse,
  fhirBaseUrl,
  openmrsFetch,
  restBaseUrl,
  showNotification,
} from "@openmrs/esm-framework";
import { type LocationEntry, type LocationResponse } from "./types";

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

export async function getProvider(
  uuid: string,
  username: string,
  password: string
) {
  const token = window.btoa(`${username}:${password}`);
  const abortController = new AbortController();
  const providerUrl = `${restBaseUrl}/provider?user=${uuid}&v=custom:(uuid,attributes:(uuid,attributeType:(uuid,display),value:(uuid,name)))`;

  return await openmrsFetch(providerUrl, {
    method: "GET",
    headers: { Authorization: `Basic ${token}` },
    signal: abortController.signal,
  });
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
