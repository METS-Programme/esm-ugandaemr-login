import { restBaseUrl, openmrsFetch } from "@openmrs/esm-framework";
import { useMemo } from "react";
import useSWR from "swr";
import { RoomsResponse } from "../types";
import { FACILITY_LOCATION_UUID } from "../constants";

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

export function useRoomLocations(clinicUuid?: string) {
  const apiUrl = clinicUuid ? `${restBaseUrl}/location/${clinicUuid}?v=full` : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: RoomsResponse }>(
    apiUrl,
    openmrsFetch
  );

  const clinicRoomLocations = useMemo(
    () => data?.data?.childLocations?.map((response) => response) ?? [],
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

export function useClinicLocations() {
  const apiUrl = `${restBaseUrl}/location/${FACILITY_LOCATION_UUID}?v=full`;
  const { data, error, isLoading, mutate } = useSWR<{ data: RoomsResponse }>(
    apiUrl,
    openmrsFetch
  );

  const clinicLocations = useMemo(
    () => data?.data?.childLocations?.map((response) => response) ?? [],
    [data?.data?.childLocations]
  );
  return {
    clinicsList: clinicLocations.filter(
      (location) => location?.uuid != null
    )
      ? clinicLocations
      : [],
    isLoading,
    error,
    mutate,
  };
}

export async function saveProvider(payload: Provider) {
  const abortController = new AbortController();
  const isUpdating = !!payload.uuid;

  const url = isUpdating
    ? `${restBaseUrl}/provider/${payload.uuid}`
    : `${restBaseUrl}/provider`;

  return await openmrsFetch(url, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      person: payload.person.uuid,
      attributes: payload.attributes?.map(attr => ({
  attributeType: typeof attr.attributeType === 'string' ? attr.attributeType : attr.attributeType.uuid,
  value: typeof attr.value === 'string' ? attr.value : attr.value.uuid
}))
    },
  });
}