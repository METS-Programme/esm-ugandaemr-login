import { restBaseUrl, openmrsFetch } from "@openmrs/esm-framework";
import { useMemo } from "react";
import useSWR from "swr";
import { RoomsResponse } from "../types";
import {
  DEFAULT_LOCATION_ATTRIBUTE_TYPE_UUID,
  FACILITY_LOCATION_UUID,
} from "../constants";

export interface Provider {
  uuid?: string;
  person: {
    uuid: string;
  };
  identifier?: string;
  attributes?: Attributes[];
}

export interface Attributes {
  display?: string;
  uuid?: string;
  attributeType: AttributeType;
  value: Value;
}

export interface AttributeType {
  uuid: string;
  display: string;
}

export interface Value {
  uuid: string;
  display: string;
}

export function useRoomLocations(currentQueueLocation?: string) {
  const apiUrl = currentQueueLocation
    ? `${restBaseUrl}/location/${currentQueueLocation}?v=full`
    : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: RoomsResponse }>(
    apiUrl,
    openmrsFetch
  );

  const clinicRoomLocations = useMemo(
    () =>
      data?.data?.parentLocation?.childLocations?.map((response) => response) ??
      [],
    [data?.data?.childLocations]
  );
  return {
    roomLocations: clinicRoomLocations.filter(
      (location) => location?.uuid != null
    )
      ? clinicRoomLocations
      : [],
    isLoading,
    error,
    mutate,
  };
}

export function getProvider(provider: string) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/provider?user=${provider}&v=full`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export async function saveProvider(providerUuid: string, attributes: any[]) {
  const abortController = new AbortController();
  const isUpdating = !!providerUuid;

  const url = isUpdating
    ? `${restBaseUrl}/provider/${providerUuid}`
    : `${restBaseUrl}/provider`;

  return await openmrsFetch(url, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ attributes }),
  });
}
