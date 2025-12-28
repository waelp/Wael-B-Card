import { useEffect } from "react";
import { I18nManager, Platform } from "react-native";
import { useI18n } from "@/lib/i18n";

/**
 * Hook to manage RTL layout based on current language
 * Note: RTL changes require app restart on native platforms
 */
export function useRTL() {
  const { language } = useI18n();
  const isRTL = language === "ar";

  useEffect(() => {
    if (Platform.OS === "web") {
      // On web, we can change RTL dynamically
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = language;
    } else {
      // On native, check if RTL setting needs to change
      // Note: This requires app restart to take effect
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // You might want to show a message to user to restart the app
        console.log(`RTL changed to ${isRTL}. Please restart the app for changes to take effect.`);
      }
    }
  }, [isRTL, language]);

  return {
    isRTL,
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
  };
}
