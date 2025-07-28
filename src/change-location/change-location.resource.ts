import { restBaseUrl, openmrsFetch } from "@openmrs/esm-framework";
import { useMemo } from "react";
import useSWR from "swr";
import { RoomsResponse } from "../types";
import {
  ADMISSION_TAG_UUID,
  CLINIC_TAG_UUID,
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

export function useClinicLocations() {
  const apiUrl = `${restBaseUrl}/location/${FACILITY_LOCATION_UUID}?v=full`;
  const { data, error, isLoading, mutate } = useSWR<{ data: RoomsResponse }>(
    apiUrl,
    openmrsFetch
  );

  const clinicsList = useMemo(() => {
    return data?.data?.childLocations?.filter((location) =>
      location.tags?.some((tag) => tag.uuid === CLINIC_TAG_UUID)
    );
  }, [data?.data?.childLocations]);

  return {
    clinicsList,
    isLoading,
    error,
    mutate,
  };
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
    [data?.data?.parentLocation?.childLocations]
  );

  return {
    roomLocations: clinicRoomLocations.filter(
      (location) => location?.uuid != null
    )
      ? clinicRoomLocations
      : [],
    parentLocation: data?.data?.parentLocation ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useClinicRoomLocations(clinicUuid?: string) {
  const apiUrl = clinicUuid
    ? `${restBaseUrl}/location/${clinicUuid}?v=full`
    : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: RoomsResponse }>(
    apiUrl,
    openmrsFetch
  );

  const clinicRooms = useMemo(
    () => data?.data?.childLocations ?? [],
    [data?.data?.childLocations]
  );

  return {
    clinicRooms,
    isLoading,
    error,
    mutate,
  };
}

export function useWardLocations(IPD_DEPARTMENT_UUID?: string) {
  const apiUrl = IPD_DEPARTMENT_UUID
    ? `${restBaseUrl}/location/${IPD_DEPARTMENT_UUID}?v=full`
    : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: RoomsResponse }>(
    apiUrl,
    openmrsFetch
  );

  const wardList = useMemo(
    () => data?.data?.childLocations ?? [],
    [data?.data?.childLocations]
  );

  return {
    wardList,
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

export async function saveProviderAttributeType(
  providerUuid: string,
  attributeUuid: string | null,
  value: string
) {
  const abortController = new AbortController();

  const url = attributeUuid
    ? `${restBaseUrl}/provider/${providerUuid}/attribute/${attributeUuid}`
    : `${restBaseUrl}/provider/${providerUuid}/attribute`;

  const payload = attributeUuid
    ? { value }
    : {
        attributeType: DEFAULT_LOCATION_ATTRIBUTE_TYPE_UUID,
        value,
      };

  return await openmrsFetch(url, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}
