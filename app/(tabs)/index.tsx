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
import { FilterModal } from "@/components/filter-modal";
import { filterService } from "@/lib/filter-service";
import type { FilterState } from "@/types/filter";
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>(filterService.clearFilters());

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
    let result = [...cards];

    // Apply filters first
    if (filterService.hasActiveFilters(filters)) {
      result = filterService.applyFilters(result, filters);
    }

    // Then apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter((card) => (
        card.companyName.toLowerCase().includes(query) ||
        card.fullName.toLowerCase().includes(query) ||
        card.jobTitle.toLowerCase().includes(query) ||
        card.department.toLowerCase().includes(query) ||
        card.mobileNumber.includes(query) ||
        card.email.toLowerCase().includes(query)
      ));
    }

    setFilteredCards(result);
  }, [searchQuery, cards, filters]);

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
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mb-3">
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
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Filter Button */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} className="px-6 mb-4">
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowFilterModal(true);
            }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: filterService.hasActiveFilters(filters)
                ? colors.primary
                : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <IconSymbol
              name="line.3.horizontal.decrease.circle"
              size={20}
              color={filterService.hasActiveFilters(filters) ? "#FFFFFF" : colors.foreground}
            />
            <Text
              className="ml-2 text-sm font-semibold"
              style={{
                color: filterService.hasActiveFilters(filters)
                  ? "#FFFFFF"
                  : colors.foreground,
              }}
            >
              Filter
              {filterService.hasActiveFilters(filters) && " (Active)"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Filter Modal */}
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          onApply={(newFilters) => {
            setFilters(newFilters);
            filterService.saveActiveFilter(newFilters);
          }}
          companies={filterService.getUniqueCompanies(cards)}
          departments={filterService.getUniqueDepartments(cards)}
          tags={filterService.getUniqueTags(cards)}
        />

        {/* Cards List */}
        {filteredCards.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.foreground }}>
              No cards yet
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.muted }}>
              Tap the + button to scan your first business card
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(index * 50).duration(400)}
                className="px-6 mb-3"
              >
                <BusinessCardItem card={item} onPress={() => handleCardPress(item)} />
              </Animated.View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        {/* FAB */}
        <Animated.View
          style={[
            fabAnimatedStyle,
            {
              position: "absolute",
              right: 24,
              bottom: 24,
            },
          ]}
        >
          <Pressable
            onPress={handleAddCard}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <IconSymbol name="plus" size={28} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
