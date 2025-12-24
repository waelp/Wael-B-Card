import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { BusinessCardItem } from "@/components/business-card-item";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { BusinessCard } from "@/types/business-card";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<BusinessCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fabScale = useSharedValue(1);

  const loadCards = useCallback(async () => {
    try {
      const loadedCards = await storageService.getAllCards();
      setCards(loadedCards);
      setFilteredCards(loadedCards);
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter((card) => {
        const query = searchQuery.toLowerCase();
        return (
          card.companyName.toLowerCase().includes(query) ||
          card.fullName.toLowerCase().includes(query) ||
          card.jobTitle.toLowerCase().includes(query) ||
          card.department.toLowerCase().includes(query) ||
          card.mobileNumber.includes(query) ||
          card.email.toLowerCase().includes(query)
        );
      });
      setFilteredCards(filtered);
    }
  }, [searchQuery, cards]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCards();
  };

  const handleAddCard = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/scan");
  };

  const handleCardPress = (card: BusinessCard) => {
    router.push({
      pathname: "/card-detail",
      params: { cardId: card.id },
    });
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabPressIn = () => {
    fabScale.value = withSpring(0.9, { damping: 15 });
  };

  const handleFabPressOut = () => {
    fabScale.value = withSpring(1, { damping: 15 });
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} className="px-6 pt-4 pb-3">
          <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
            Business Card Vault
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {cards.length} {cards.length === 1 ? "card" : "cards"} saved
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mb-4">
          <View
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Search cards..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ color: colors.foreground }}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <IconSymbol name="xmark" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Cards List */}
        {filteredCards.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="flex-1 items-center justify-center px-6"
          >
            <IconSymbol name="house.fill" size={64} color={colors.muted} />
            <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: colors.foreground }}>
              {searchQuery ? "No cards found" : "No cards yet"}
            </Text>
            <Text className="text-center text-sm" style={{ color: colors.muted }}>
              {searchQuery
                ? "Try a different search term"
                : "Tap the + button to scan your first business card"}
            </Text>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(index * 50).duration(400)}
                className="px-6"
              >
                <BusinessCardItem card={item} onPress={() => handleCardPress(item)} />
              </Animated.View>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}

        {/* FAB Button */}
        <Animated.View
          style={[
            fabAnimatedStyle,
            {
              position: "absolute",
              bottom: 24,
              right: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        >
          <Pressable
            onPress={handleAddCard}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            style={{
              backgroundColor: colors.primary,
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol name="plus" size={28} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
