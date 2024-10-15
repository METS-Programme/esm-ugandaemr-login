import { type ConfigSchema, useConfig } from "@openmrs/esm-framework";
import React from "react";

const LoginBackground = () => {
  const { loginBackgroundUrl } = useConfig();

  return loginBackgroundUrl.src ? (
    <img
      src={loginBackgroundUrl.src}
      alt={loginBackgroundUrl.alt}
      title="UgandaEMR+ Background"
    />
  ) : (
    <img
      src="/assets/background.png"
      alt="UgandaEMR+ Background"
      title="UgandaEMR+ Background"
    />
  );
};

export default LoginBackground;
