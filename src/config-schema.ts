import { validators, Type } from "@openmrs/esm-framework";

export const configSchema = {
  defaultLoginLocationUuid: {
    _type: Type.String,
    _default: "629d78e9-93e5-43b0-ad8a-48313fd99117",
    _description:
      "Default session location UUID used when user has not selected a location.",
  },
  provider: {
    type: {
      _type: Type.String,
      _default: "basic",
      _description:
        "Selects the login mechanism to use. Choices are 'basic' and 'oauth2'. " +
        "For 'oauth2' you'll also need to set the 'loginUrl' and 'logoutUrl'.",
    },
    loginUrl: {
      _type: Type.String,
      _default: "${openmrsSpaBase}/login",
      _description: "The URL to use for an OAuth2 login.",
      _validators: [validators.isUrl],
    },
    logoutUrl: {
      _type: Type.String,
      _default: "${openmrsSpaBase}/logout",
      _description: "The URL to use for an OAuth2 logout.",
      _validators: [validators.isUrl],
    },
    attributeTypeUUID: {
      _type: Type.String,
      _default: "13a721e4-68e5-4f7a-8aee-3cbcec127179",
      _description: "The UUID for picking provider's default location",
    },
  },
  links: {
    loginSuccess: {
      _type: Type.String,
      _description: "Where to take the user after they are logged in.",
      _default: "${openmrsSpaBase}/home/patient-queues",
      _validators: [validators.isUrl],
    },
  },
  logo: {
    src: {
      _type: Type.String,
      _default: "/openmrs/spa/logo.svg",
      _description:
        "A path or URL to an image. If null, will use the OpenMRS SVG sprite.",
      _validators: [validators.isUrl],
    },
    alt: {
      _type: Type.String,
      _default: "Logo",
      _description: "Alt text, shown on hover",
    },
  },
  loginBackground: {
    src: {
      _type: Type.String,
      _default: "/openmrs/spa/background.png",
      _description:
        "A path or URL to an image. If null, will use the OpenMRS SVG sprite.",
      _validators: [validators.isUrl],
    },
    alt: {
      _type: Type.String,
      _default: "Background",
      _description: "Alt text, shown on hover",
    },
  },
  loginBanner: {
    src: {
      _type: Type.String,
      _default: "/openmrs/spa/banner.svg",
      _description:
        "A path or URL to an image. If null, will use the OpenMRS SVG sprite.",
      _validators: [validators.isUrl],
    },
    alt: {
      _type: Type.String,
      _default: "OpenMRS Logo",
      _description: "Alt text, shown on hover",
    },
  },
  showCenteredLogin: {
    _type: Type.Boolean,
    _description: "Whether to show the login screen centered.",
    _default: false,
  },
  showDefaultHome: {
    _type: Type.Boolean,
    _description: "Whether to show/use the default /home link.",
    _default: false,
  },
  supportEmail: {
    _type: Type.String,
    _default: "emrtalk@musph.ac.ug",
    _description: "Support email for the system",
  },
  footerOpenMRSLogo: {
    _type: Type.String,
    _default: "omrs-logo-partial-mono",
    _description: "Choice of powered by OpenMRS logo to render",
  },
  orgUrl: {
    _type: Type.String,
    _default: "http://www.health.go.ug/",
    _description: "Organization Url",
  },

  orgDescription: {
    _type: Type.String,
    _default: "Ministry of Health - Republic of Uganda",
    _description: "Ministry of Health - Republic of Uganda",
  },
};
