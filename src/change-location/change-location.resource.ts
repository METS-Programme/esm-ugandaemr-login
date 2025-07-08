import { restBaseUrl, openmrsFetch } from "@openmrs/esm-framework";
import { useMemo } from "react";
import useSWR from "swr";
import { RoomsResponse } from "../types";

export function useRoomLocations(currentLocation: string) {
  const apiUrl = `${restBaseUrl}/location/${currentLocation}?v=full`;
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
