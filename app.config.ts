import "dotenv/config";

export default {
  expo: {
    name: "My Dear Radish Spirit",
    slug: "my-dear-radish-spirit",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    splash: {
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.abhi514.mydearradishspirit",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
    },
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      eas: {
        projectId: "8a1939a0-7fc9-40bb-8478-485713468311",
      },
    },
    plugins: [],
  },
};
