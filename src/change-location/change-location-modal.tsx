import React, { useState } from "react";
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
import {
  DefaultWorkspaceProps,
  useLayoutType,
  useSession,
} from "@openmrs/esm-framework";
import { Controller, useForm } from "react-hook-form";
import styles from "./change-location-link.scss";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRoomLocations } from "./change-location.resource";

type ChangeLocationProps = DefaultWorkspaceProps;

const ChangeLocationModal: React.FC<ChangeLocationProps> = ({
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";
  const session = useSession();
  const currentLocation = session?.sessionLocation?.display;
  const [isChangingRoom, setIsChangingRoom] = useState(false);

  const { roomLocations, error: errorFetchingRooms } = useRoomLocations(
    session?.sessionLocation?.uuid
  );
  const [selectedClinciRoom, setselectedClinciRoom] = useState();

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
  return (
    <Form>
      <ModalHeader
        closeModal={close}
        title={t("changeLocation", "Change location")}
      />
      <ModalBody>
        <Stack gap={5} className={styles.languageOptionsContainer}>
          <ResponsiveWrapper isTablet={isTablet}>
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
                  invalid={!!errors.locationTo}
                  invalidText={errors.locationTo?.message}
                  value={field.value}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    field.onChange(selectedValue);
                    setselectedClinciRoom(selectedValue);
                  }}
                >
                  {!field.value && (
                    <SelectItem
                      value=""
                      text={t(
                        "selectNextServicePoint",
                        "Choose next service point"
                      )}
                    />
                  )}

                  {roomLocations.map(({ uuid, display }) => (
                    <SelectItem key={uuid} value={uuid} text={display} />
                  ))}
                </Select>
              )}
            />

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
              description={t("changingPassword", "Changing password") + "..."}
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
