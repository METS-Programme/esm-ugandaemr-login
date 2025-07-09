import React, { useCallback, useState } from "react";
import {
  Button,
  ContentSwitcher,
  Form,
  Hospital,
  Layer,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Stack,
  Switch,
  TaskLocation,
  InlineNotification,
  InlineLoading,
} from "@carbon/react";
import {
  DefaultWorkspaceProps,
  showSnackbar,
  useLayoutType,
  useSession,
} from "@openmrs/esm-framework";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styles from "./change-location-link.scss";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Provider, saveProvider, useClinicLocations, useRoomLocations } from "./change-location.resource";

type ChangeLocationProps = DefaultWorkspaceProps;

const ChangeLocationModal: React.FC<ChangeLocationProps> = ({
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";
  const [tabType, setTabType] = useState("Change room");
  const session = useSession();
  const currentLocation = session?.sessionLocation?.uuid;
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const [selectedClinicRoom, setselectedClinicRoom] = useState<string | undefined>();
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>();
  const { roomLocations, error: errorFetchingRooms } = useRoomLocations(selectedClinic);
  const {clinicsList, error: errorFetchingClinics} = useClinicLocations();

  const handleTabTypeChange = ({ name }) => {
    setTabType(name);
  };

  const changeLocationSchema = z.object({
    clinicRoom: z.string().optional(),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changeLocationSchema),
  });

const onSubmit: SubmitHandler<any> = useCallback(
  (data) => {
    setIsChangingRoom(true);

    const newLocationUuid = data.clinicRoom ?? data.clinic;
    const providerUuid = session?.currentProvider?.uuid;
    const personUuid = session?.user?.person?.uuid;

    const payload: Provider = {
      uuid: providerUuid,
      person: { uuid: personUuid },
      attributes: [
        {
          attributeType: {
            uuid: "13a721e4-68e5-4f7a-8aee-3cbcec127179",
            display: "Default Location",
          },
          value: {
            uuid: newLocationUuid,
            display: roomLocations.find(loc => loc.uuid === newLocationUuid)?.display || "Selected Location"
          }
        }
      ],
    };

    saveProvider(payload)
      .then(() => {
        closeWorkspace();
        showSnackbar({
          title: t("locationChanged", "Default location updated"),
          kind: "success",
        });
      })
      .catch((error) => {
        const errorMessage =
          error?.responseBody?.message || error?.message || "An unexpected error occurred";
        console.error("Provider update failed:", errorMessage);
      })
      .finally(() => {
        setIsChangingRoom(false);
      });
  },
  [session, closeWorkspace, t, roomLocations]
);


  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        closeModal={close}
        title={t("changeLocation", "Change location")}
      />
      <ModalBody>
        
        <ContentSwitcher onChange={handleTabTypeChange}>
  <Switch name="Change room" text={t("changeRoom", "Switch room")} />
  <Switch name="Change clinic" text={t("changeClinic", "Switch only clinic")} />
</ContentSwitcher>

        <Stack gap={5} className={styles.languageOptionsContainer}>
          <ResponsiveWrapper isTablet={isTablet}>
            {tabType === "Change room" && (
              <><Controller
              name="clinicLocation"
              control={control}
              defaultValue=""
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
                      text={t(
                        "selectClinic",
                        "Choose clinic"
                      )}
                    />
                  )}

                  {clinicsList.map(({ uuid, display }) => (
                    <SelectItem key={uuid} value={uuid} text={display} />
                  ))}
                </Select>
              )}
            />
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
                  disabled={!selectedClinic || errorFetchingRooms}
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
                      text={t(
                        "selectRoom",
                        "Choose room"
                      )}
                    />
                  )}

                  {roomLocations.map(({ uuid, display }) => (
                    <SelectItem key={uuid} value={uuid} text={display} />
                  ))}
                </Select>
              )}
            /></>
            )}
            {tabType === "Change clinic" && (
            <Controller
              name="clinic"
              control={control}
              defaultValue={currentLocation}
              render={({ field }) => (
                <Select
                  {...field}
                  id="clinic"
                  name="clinic"
                  labelText="Select clinic to change to"
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
                      text={t(
                        "selectClinic",
                        "Choose clinic"
                      )}
                    />
                  )}

                  {clinicsList.map(({ uuid, display }) => (
                    <SelectItem key={uuid} value={uuid} text={display} />
                  ))}
                </Select>
              )}
            />)}

            {errorFetchingRooms && (
              <InlineNotification
                className={styles.errorNotification}
                kind="error"
                title={t(
                  "errorFetchingQueueRooms",
                  "Error fetching queue rooms"
                )}
                subtitle={errorFetchingRooms}
                onClick={() => {}}
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
