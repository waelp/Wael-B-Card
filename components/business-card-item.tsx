import { View, Text, Pressable, Linking, Platform } from "react-native";
import { BusinessCard } from "@/types/business-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface BusinessCardItemProps {
  card: BusinessCard;
  onPress: () => void;
}

export function BusinessCardItem({ card, onPress }: BusinessCardItemProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handlePhonePress = (phoneNumber: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = (email: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Company Name */}
        <View className="flex-row items-center mb-2">
          <IconSymbol name="house.fill" size={16} color={colors.primary} />
          <Text
            className="ml-2 text-sm font-semibold"
            style={{ color: colors.primary }}
          >
            {card.companyName}
          </Text>
        </View>

        {/* Full Name */}
        <Text className="text-lg font-bold mb-1" style={{ color: colors.foreground }}>
          {card.fullName}
        </Text>

        {/* Job Title & Department */}
        <View className="flex-row items-center mb-3">
          <Text className="text-sm" style={{ color: colors.muted }}>
            {card.jobTitle}
            {card.department && ` • ${card.department}`}
          </Text>
        </View>

        {/* Contact Info */}
        <View className="gap-2">
          {/* Mobile */}
          {card.mobileNumber && (
            <Pressable
              onPress={() => handlePhonePress(card.mobileNumber)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <IconSymbol name="paperplane.fill" size={14} color={colors.success} />
              <Text className="ml-2 text-sm" style={{ color: colors.foreground }}>
                {card.mobileNumber}
              </Text>
            </Pressable>
          )}

          {/* Email */}
          {card.email && (
            <Pressable
              onPress={() => handleEmailPress(card.email)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <IconSymbol
                name="paperplane.fill"
                size={14}
                color={colors.primary}
              />
              <Text className="ml-2 text-sm" style={{ color: colors.foreground }}>
                {card.email}
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
