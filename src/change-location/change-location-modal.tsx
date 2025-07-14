import React, { useCallback, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Layer,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  showSnackbar,
  Stack,
  InlineNotification,
  InlineLoading,
} from "@carbon/react";
import { useLayoutType, useSession } from "@openmrs/esm-framework";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styles from "./change-location-link.scss";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  getProvider,
  saveProviderAttributeType,
  useRoomLocations,
} from "./change-location.resource";
import {
  DEFAULT_LOCATION_ATTRIBUTE_TYPE_UUID,
  locationChangerList,
} from "../constants";
import { LocationOption } from "../types";

interface ChangeLocationProps {
  close(): () => void;
}

const ChangeLocationModal: React.FC<ChangeLocationProps> = ({ close }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";
  const session = useSession();
  const sessionUser = useSession();
  const currentLocation = session?.sessionLocation?.uuid;
  const locationList = locationChangerList.map((item) => ({
    id: item.id,
    label: item.label,
  }));
  const [selectedLocationOption, setSelectedLocationOption] = useState<
    LocationOption | undefined
  >();
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const [selectedClinicRoom, setselectedClinicRoom] = useState<
    string | undefined
  >();
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState(null);
  const { roomLocations, error: errorFetchingRooms } = useRoomLocations(
    sessionUser?.sessionLocation?.uuid
  );

  const changeLocationSchema = z.object({
    clinicRoom: z.string().min(1, "Room is required"),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changeLocationSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof changeLocationSchema>> =
    useCallback(
      (data) => {
        setIsChangingRoom(true);

        const userUuid = sessionUser?.user?.uuid;
        const roomUuid = data?.clinicRoom;

        if (!userUuid || !roomUuid) return;

        getProvider(userUuid)
          .then((response) => {
            const provider = response?.data?.results?.[0];
            const providerUuid = provider?.uuid;

            if (!providerUuid) throw new Error("Provider not found");

            const existingLocationAttribute = provider?.attributes?.find(
              (attr) =>
                attr?.attributeType?.uuid ===
                DEFAULT_LOCATION_ATTRIBUTE_TYPE_UUID
            );

            const attributeUuid = existingLocationAttribute?.uuid ?? null;

            return saveProviderAttributeType(
              providerUuid,
              attributeUuid,
              roomUuid
            );
          })
          .then(() => {
            close();
            showSnackbar({
              title: t(
                "locationChangedSuccessfully",
                "Location changed successfully"
              ),
              kind: "success",
            });
          })
          .catch((error) => {
            const errorMessage = error?.responseBody?.message ?? error?.message;
            setErrorMessage(errorMessage);
          })
          .finally(() => {
            setIsChangingRoom(false);
          });
      },
      [sessionUser?.user?.uuid, close, t]
    );

  const onError = () => setIsChangingRoom(false);

  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)}>
      <ModalHeader
        closeModal={close}
        title={t("changeLocation", "Change location")}
      />
      <ModalBody>
        <Stack gap={5} className={styles.languageOptionsContainer}>
          <ResponsiveWrapper isTablet={isTablet}>
            <Dropdown
              id="location-options"
              titleText={t(
                "locationChangerOptions",
                "Select location change option"
              )}
              itemToString={(item) => (item ? item.label : "")}
              items={locationList}
              label="Choose option"
              selectedItem={selectedLocationOption}
              onChange={(event) =>
                setSelectedLocationOption(event.selectedItem)
              }
            />
            {selectedLocationOption?.id === "switchRoom" && (
              <Controller
                name="clinicRoom"
                control={control}
                defaultValue={currentLocation}
                render={({ field }) => (
                  <Select
                    {...field}
                    id="clinicRoom"
                    name="clinicRoom"
                    labelText="Select room to change to"
                    disabled={errorFetchingRooms}
                    invalidText={errors.locationTo?.message}
                    value={field.value}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      field.onChange(selectedValue);
                      setselectedClinicRoom(selectedValue);
                    }}
                  >
                    {!field.value && (
                      <SelectItem
                        value=""
                        text={t("selectRoom", "Choose room")}
                      />
                    )}

                    {roomLocations.map(({ uuid, display }) => (
                      <SelectItem key={uuid} value={uuid} text={display} />
                    ))}
                  </Select>
                )}
              />
            )}
            {selectedLocationOption?.id === "" && (
              <Controller
                name="clinicLocation"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    {...field}
                    id="clinicLocation"
                    name="clinicLocation"
                    labelText="Select clinic"
                    // disabled={errorFetchingClinics}
                    invalidText={errors.root?.message}
                    value={field.value}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      field.onChange(selectedValue);
                      setSelectedClinic(selectedValue);
                    }}
                  >
                    {!field.value && (
                      <SelectItem
                        value=""
                        text={t("selectClinic", "Choose clinic")}
                      />
                    )}

                    {/* {clinicsList.map(({ uuid, display }) => (
                    <SelectItem key={uuid} value={uuid} text={display} />
                  ))} */}
                  </Select>
                )}
              />
            )}

            {errorFetchingRooms && (
              <InlineNotification
                className={styles.errorNotification}
                kind="error"
                title={t(
                  "errorFetchingQueueRooms",
                  "Error fetching queue rooms"
                )}
                subtitle={errorFetchingRooms}
                onClick={() => setErrorMessage("")}
              />
            )}
          </ResponsiveWrapper>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t("cancel", "Cancel")}
        </Button>
        <Button
          className={styles.submitButton}
          disabled={isChangingRoom}
          type="submit"
        >
          {isChangingRoom ? (
            <InlineLoading
              description={t("changingLocation", "Changing location") + "..."}
            />
          ) : (
            <span>{t("change", "Change")}</span>
          )}
        </Button>
      </ModalFooter>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }) {
  return isTablet ? <Layer>{children}</Layer> : <div>{children}</div>;
}

export default ChangeLocationModal;
