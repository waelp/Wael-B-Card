import { View, Text, Pressable, ScrollView, Platform, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function SettingsScreen() {
  const colors = useColors();
  const { language, setLanguage, t } = useI18n();

  const handleLanguageChange = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      t("settings.change_language"),
      t("settings.change_language_confirm"),
      [
        { text: t("button.cancel"), style: "cancel" },
        {
          text: t("button.ok"),
          onPress: async () => {
            try {
              await setLanguage(newLanguage);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert(
                t("settings.language_changed"),
                t("settings.language_changed_desc")
              );
            } catch (error) {
              console.error("Error changing language:", error);
              Alert.alert(t("button.error"), t("settings.language_change_error"));
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      t("settings.clear_data"),
      t("settings.clear_data_confirm"),
      [
        { text: t("button.cancel"), style: "cancel" },
        {
          text: t("settings.clear_all"),
          style: "destructive",
          onPress: async () => {
            try {
              await storageService.clearAll();
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert(t("button.success"), t("settings.data_cleared"));
            } catch (error) {
              Alert.alert(t("button.error"), t("settings.clear_data_error"));
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    danger,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: danger ? colors.error + "20" : colors.primary + "20" }}
        >
          <IconSymbol
            name={icon}
            size={20}
            color={danger ? colors.error : colors.primary}
          />
        </View>
        <View className="flex-1 ml-3">
          <Text
            className="text-base font-semibold"
            style={{ color: danger ? colors.error : colors.foreground }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm mt-1" style={{ color: colors.muted }}>
              {subtitle}
            </Text>
          )}
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} className="px-6 pt-4 pb-3">
          <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
            {t("settings.title")}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {t("settings.subtitle")}
          </Text>
        </Animated.View>

        {/* Settings List */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mt-4">
          <Text className="text-xs font-semibold mb-3" style={{ color: colors.muted }}>
            {t("settings.general")}
          </Text>

          <SettingItem
            icon="house.fill"
            title={t("settings.language")}
            subtitle={language === "en" ? "English (العربية)" : "العربية (English)"}
            onPress={handleLanguageChange}
          />

          <View className="mt-6 mb-3">
            <Text className="text-xs font-semibold mb-3" style={{ color: colors.muted }}>
              {t("settings.data")}
            </Text>
          </View>

          <SettingItem
            icon="trash.fill"
            title={t("settings.clear_data")}
            subtitle={t("settings.clear_data_subtitle")}
            onPress={handleClearData}
            danger
          />

          <View className="mt-6 mb-3">
            <Text className="text-xs font-semibold mb-3" style={{ color: colors.muted }}>
              {t("settings.about")}
            </Text>
          </View>

          <View
            className="p-4 rounded-xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm mb-1" style={{ color: colors.foreground }}>
              {t("home.title")}
            </Text>
            <Text className="text-xs" style={{ color: colors.muted }}>
              {t("settings.version")}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
