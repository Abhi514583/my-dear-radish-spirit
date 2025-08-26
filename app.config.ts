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
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
    },
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
    plugins: [
      [
        "expo-notifications",
        {
          color: "#ffffff",
        },
      ],
    ],
  },
};
