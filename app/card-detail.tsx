import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { BusinessCard } from "@/types/business-card";
import * as Haptics from "expo-haptics";

export default function CardDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      const cards = await storageService.getAllCards();
      const foundCard = cards.find((c) => c.id === cardId);
      if (foundCard) {
        setCard(foundCard);
      }
    } catch (error) {
      console.error("Error loading card:", error);
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleCall = (phoneNumber: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Card",
      "Are you sure you want to delete this business card?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (card) {
                await storageService.deleteCard(card.id);
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                }
                router.back();
              }
            } catch (error) {
              console.error("Error deleting card:", error);
            }
          },
        },
      ]
    );
  };

  if (!card) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ color: colors.foreground }}>Card not found</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconSymbol name="trash.fill" size={22} color={colors.error} />
          </Pressable>
        </View>

        {/* Card Details */}
        <View className="px-6">
          {/* Company */}
          <View
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="text-xs mb-1" style={{ color: colors.muted }}>
              Company
            </Text>
            <Text className="text-xl font-bold" style={{ color: colors.primary }}>
              {card.companyName}
            </Text>
          </View>

          {/* Name */}
          <View
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="text-xs mb-1" style={{ color: colors.muted }}>
              Full Name
            </Text>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              {card.fullName}
            </Text>
          </View>

          {/* Job Title & Department */}
          <View className="flex-row gap-3 mb-4">
            <View
              className="flex-1 p-4 rounded-xl"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                Job Title
              </Text>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {card.jobTitle}
              </Text>
            </View>
            {card.department && (
              <View
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                  Department
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  {card.department}
                </Text>
              </View>
            )}
          </View>

          {/* Contact Actions */}
          <View className="gap-3 mb-4">
            {/* Mobile */}
            {card.mobileNumber && (
              <Pressable
                onPress={() => handleCall(card.mobileNumber)}
                style={({ pressed }) => ({
                  backgroundColor: colors.success,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <IconSymbol name="phone.fill" size={20} color="#FFFFFF" />
                <Text className="ml-3 text-base font-semibold text-white">
                  Call {card.mobileNumber}
                </Text>
              </Pressable>
            )}

            {/* Email */}
            {card.email && (
              <Pressable
                onPress={() => handleEmail(card.email)}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <IconSymbol name="envelope.fill" size={20} color="#FFFFFF" />
                <Text className="ml-3 text-base font-semibold text-white">
                  Email {card.email}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Additional Info */}
          <View
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="text-xs mb-2" style={{ color: colors.muted }}>
              Date Added
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              {new Date(card.dateAdded).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
