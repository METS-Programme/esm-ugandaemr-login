import React, { useCallback, useState } from "react";
import {
  Button,
  Form,
  Layer,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Stack,
  InlineNotification,
  InlineLoading,
} from "@carbon/react";
import { navigate, useLayoutType, useSession } from "@openmrs/esm-framework";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styles from "./change-location-link.scss";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  getProvider,
  saveProviderAttributeType,
  useClinicLocations,
  useClinicRoomLocations,
  useRoomLocations,
  useWardLocations,
} from "./change-location.resource";
import {
  DEFAULT_LOCATION_ATTRIBUTE_TYPE_UUID,
  IPD_DEPARTMENT_UUID,
  locationChangerList,
} from "../constants";

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
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const [selectedClinicRoom, setSelectedClinicRoom] = useState<
    string | undefined
  >();
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState(null);
  const {
    roomLocations,
    error: errorFetchingRooms,
    parentLocation,
  } = useRoomLocations(sessionUser?.sessionLocation?.uuid);
  const { clinicRooms, error: errorFetchingClinicRooms } =
    useClinicRoomLocations(selectedClinic);
  const { clinicsList, error: errorFetchingClinics } = useClinicLocations();
  const { wardList, error: errorfetchingWard } =
    useWardLocations(IPD_DEPARTMENT_UUID);
  const [selectedWard, setSelectedWard] = useState<string | undefined>();
  const openmrsSpaBase = window["getOpenmrsSpaBase"]();

  const changeLocationSchema = z.object({
    locationOption: z.object({
      id: z.string(),
      label: z.string(),
    }),
    clinicRoom: z.string().optional(),
    clinicRoomFromClinicSelection: z.string().optional(),
    wardRoom: z.string().optional(),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(changeLocationSchema),
  });

  const locationOption = watch("locationOption");

  const onSubmit: SubmitHandler<z.infer<typeof changeLocationSchema>> =
    useCallback(
      (data) => {
        setIsChangingRoom(true);

        const userUuid = sessionUser?.user?.uuid;
        const roomUuid =
          data?.locationOption?.id === "switchRoom"
            ? data?.clinicRoom
            : data?.locationOption?.id === "switchClinic"
            ? data?.clinicRoomFromClinicSelection
            : data?.locationOption?.id === "switchWard"
            ? data?.wardRoom
            : null;

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
            navigate({ to: `${openmrsSpaBase}logout` });
          })

          .catch((error) => {
            const errorMessage = error?.responseBody?.message ?? error?.message;
            setErrorMessage(errorMessage);
          })
          .finally(() => {
            setIsChangingRoom(false);
          });
      },
      [sessionUser?.user?.uuid, close, t, openmrsSpaBase]
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
            <Controller
              name="locationOption"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  id="locationOption"
                  name="locationOption"
                  labelText="Choose location change option"
                  value={field.value?.id ?? ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedObj = locationList.find(
                      (loc) => loc.id === selectedId
                    );
                    field.onChange(selectedObj);
                  }}
                >
                  <SelectItem
                    value=""
                    text={t("selectLocationChanger", "Choose option")}
                  />
                  {locationList.map(({ id, label }) => (
                    <SelectItem key={id} value={id} text={label} />
                  ))}
                </Select>
              )}
            />

            {locationOption?.id === "switchRoom" && (
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
                    invalidText={errors.root?.message}
                    value={field.value}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      field.onChange(selectedValue);
                      setSelectedClinicRoom(selectedValue);
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
            {locationOption?.id === "switchClinic" && (
              <>
                <Controller
                  name="clinicLocation"
                  control={control}
                  defaultValue={parentLocation?.uuid}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id="clinicLocation"
                      name="clinicLocation"
                      labelText="Select clinic"
                      disabled={errorFetchingClinics}
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

                      {clinicsList.map(({ uuid, display }) => (
                        <SelectItem key={uuid} value={uuid} text={display} />
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="clinicRoomFromClinicSelection"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      {...field}
                      id="clinicRoomFromClinicSelection"
                      labelText="Select room in clinic"
                      disabled={!selectedClinic || errorFetchingClinicRooms}
                      value={field.value}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        field.onChange(selectedValue);
                        setSelectedClinicRoom(selectedValue);
                      }}
                    >
                      <SelectItem
                        value=""
                        text={t("selectRoom", "Choose room")}
                      />
                      {clinicRooms.map(({ uuid, display }) => (
                        <SelectItem key={uuid} value={uuid} text={display} />
                      ))}
                    </Select>
                  )}
                />
              </>
            )}
            {locationOption?.id === "switchWard" && (
              <Controller
                name="wardRoom"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    {...field}
                    id="wardRoom"
                    name="wardRoom"
                    labelText="Select ward to change to"
                    disabled={errorfetchingWard}
                    invalidText={errors.root?.message}
                    value={field.value}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      field.onChange(selectedValue);
                      setSelectedWard(selectedValue);
                    }}
                  >
                    {!field.value && (
                      <SelectItem
                        value=""
                        text={t("selectWard", "Choose ward")}
                      />
                    )}

                    {wardList.map(({ uuid, display }) => (
                      <SelectItem key={uuid} value={uuid} text={display} />
                    ))}
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
