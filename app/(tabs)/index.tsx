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
  Image,
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
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
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
  const fabRotation = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  // Animate header on mount
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1, { damping: 12 });
  }, []);

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
    // Animate FAB rotation
    fabRotation.value = withSequence(
      withTiming(15, { duration: 100 }),
      withTiming(-15, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    router.push("/scan");
  };

  const handleCardPress = (card: BusinessCard) => {
    router.push({
      pathname: "/card-detail",
      params: { cardId: card.id },
    });
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${fabRotation.value}deg` },
    ],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
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
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="cover"
            />
          </View>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={{ color: colors.muted, marginTop: 12 }}>Loading...</Text>
        </Animated.View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <View className="flex-1">
        {/* Modern Gradient Header */}
        <Animated.View style={headerAnimatedStyle}>
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 20,
              backgroundColor: colors.background,
            }}
          >
            {/* Logo and Title Row */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Animated.View style={logoAnimatedStyle}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    overflow: "hidden",
                    marginRight: 12,
                    shadowColor: "#1E3A8A",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Image
                    source={require("@/assets/images/icon.png")}
                    style={{ width: 48, height: 48 }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#1E3A8A",
                    letterSpacing: -0.5,
                  }}
                >
                  Wael Allam
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#0D9488",
                    fontWeight: "600",
                    letterSpacing: 0.5,
                  }}
                >
                  Business Cards
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#1E3A8A15",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1E3A8A",
                  }}
                >
                  {cards.length}
                </Text>
              </View>
            </View>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: 13,
                color: colors.muted,
                marginLeft: 60,
              }}
            >
              {cards.length === 0
                ? "Start scanning your business cards"
                : `${cards.length} ${cards.length === 1 ? "card" : "cards"} in your collection`}
            </Text>
          </View>
        </Animated.View>

        {/* Search Bar with Modern Design */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mb-3">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: searchQuery ? "#1E3A8A" : colors.border,
              shadowColor: "#1E3A8A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: searchQuery ? 0.15 : 0.05,
              shadowRadius: 8,
              elevation: searchQuery ? 4 : 2,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "#1E3A8A15",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="magnifyingglass" size={18} color="#1E3A8A" />
            </View>
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: colors.foreground,
              }}
              placeholder="Search by name, company, position..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                  padding: 4,
                })}
              >
                <IconSymbol name="xmark.circle.fill" size={22} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Filter Button with Gradient */}
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
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 14,
              backgroundColor: filterService.hasActiveFilters(filters)
                ? "#1E3A8A"
                : colors.surface,
              borderWidth: filterService.hasActiveFilters(filters) ? 0 : 1.5,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
              shadowColor: filterService.hasActiveFilters(filters) ? "#1E3A8A" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: filterService.hasActiveFilters(filters) ? 0.3 : 0.1,
              shadowRadius: 6,
              elevation: filterService.hasActiveFilters(filters) ? 4 : 2,
            })}
          >
            <IconSymbol
              name="line.3.horizontal.decrease.circle"
              size={20}
              color={filterService.hasActiveFilters(filters) ? "#FFFFFF" : "#1E3A8A"}
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 15,
                fontWeight: "600",
                color: filterService.hasActiveFilters(filters) ? "#FFFFFF" : "#1E3A8A",
              }}
            >
              Filter
              {filterService.hasActiveFilters(filters) && " • Active"}
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

        {/* Cards List or Empty State */}
        {filteredCards.length === 0 ? (
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
          >
            {/* Empty State Illustration */}
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 30,
                backgroundColor: "#1E3A8A10",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <IconSymbol name="creditcard" size={56} color="#1E3A8A" />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No cards yet
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.muted,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Tap the + button below to scan your first business card and start building your collection
            </Text>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={SlideInRight.delay(index * 60).duration(400).springify()}
                className="px-6 mb-3"
              >
                <BusinessCardItem card={item} onPress={() => handleCardPress(item)} />
              </Animated.View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#1E3A8A"
                colors={["#1E3A8A", "#0D9488"]}
              />
            }
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Modern FAB with Gradient Effect */}
        <Animated.View
          style={[
            fabAnimatedStyle,
            {
              position: "absolute",
              right: 24,
              bottom: 32,
            },
          ]}
        >
          <Pressable
            onPress={handleAddCard}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              backgroundColor: "#1E3A8A",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#1E3A8A",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 20,
                backgroundColor: "#0D9488",
                opacity: 0.3,
              }}
            />
            <IconSymbol name="plus" size={30} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
