import { View, Text, Pressable, ScrollView, Platform, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function SettingsScreen() {
  const colors = useColors();

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all business cards? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await storageService.clearAll();
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert("Success", "All data has been cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data.");
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
            Settings
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            Manage your app preferences
          </Text>
        </Animated.View>

        {/* Settings List */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mt-4">
          <Text className="text-xs font-semibold mb-3" style={{ color: colors.muted }}>
            GENERAL
          </Text>

          <SettingItem
            icon="house.fill"
            title="Language"
            subtitle="English (العربية coming soon)"
            onPress={() => {
              Alert.alert("Language", "Arabic language support will be added soon.");
            }}
          />

          <View className="mt-6 mb-3">
            <Text className="text-xs font-semibold mb-3" style={{ color: colors.muted }}>
              DATA
            </Text>
          </View>

          <SettingItem
            icon="trash.fill"
            title="Clear All Data"
            subtitle="Delete all saved business cards"
            onPress={handleClearData}
            danger
          />

          <View className="mt-6 mb-3">
            <Text className="text-xs font-semibold mb-3" style={{ color: colors.muted }}>
              ABOUT
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
              Business Card Vault
            </Text>
            <Text className="text-xs" style={{ color: colors.muted }}>
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
