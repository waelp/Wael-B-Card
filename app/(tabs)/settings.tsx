import { View, Text, Pressable, ScrollView, Platform, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import { exportService } from "@/lib/export-service";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
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

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const cards = await storageService.getAllCards();
      
      if (cards.length === 0) {
        Alert.alert(t("button.error"), t("settings.no_cards_to_export"));
        return;
      }

      await exportService.exportToCSV(cards);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(t("button.success"), t("settings.export_success"));
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      Alert.alert(t("button.error"), t("settings.export_error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const cards = await storageService.getAllCards();
      
      if (cards.length === 0) {
        Alert.alert(t("button.error"), t("settings.no_cards_to_export"));
        return;
      }

      await exportService.exportToExcel(cards);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(t("button.success"), t("settings.export_success"));
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Alert.alert(t("button.error"), t("settings.export_error"));
    } finally {
      setIsExporting(false);
    }
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
              IMPORT / EXPORT
            </Text>
          </View>

          <SettingItem
            icon="arrow.down.doc.fill"
            title="Import from CSV/Excel"
            subtitle="Add cards from external file"
            onPress={() => router.push("/import")}
          />

          <SettingItem
            icon="paperplane.fill"
            title={t("settings.export_csv")}
            subtitle={t("settings.export_csv_subtitle")}
            onPress={handleExportCSV}
          />

          <SettingItem
            icon="paperplane.fill"
            title={t("settings.export_excel")}
            subtitle={t("settings.export_excel_subtitle")}
            onPress={handleExportExcel}
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
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={{ width: 40, height: 40, borderRadius: 10, marginRight: 12 }}
                resizeMode="cover"
              />
              <View>
                <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                  BizCapture
                </Text>
                <Text className="text-xs" style={{ color: "#06B6D4" }}>
                  by DSOX
                </Text>
              </View>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>
              Version 1.0.0
            </Text>
            <Text className="text-xs mt-2" style={{ color: colors.muted, lineHeight: 18 }}>
              DSOX - A global company dedicated to simplifying the business world and creating professional dashboards.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
