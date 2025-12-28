import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { BusinessCard } from "@/types/business-card";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useI18n } from "@/lib/i18n";

export default function TableScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useI18n();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<BusinessCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "company" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    filterAndSortCards();
  }, [cards, searchQuery, sortBy, sortOrder]);

  const loadCards = async () => {
    const allCards = await storageService.getAllCards();
    setCards(allCards);
  };

  const filterAndSortCards = () => {
    let filtered = cards;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = cards.filter(
        (card) =>
          card.fullName.toLowerCase().includes(query) ||
          card.companyName.toLowerCase().includes(query) ||
          card.jobTitle.toLowerCase().includes(query) ||
          card.department.toLowerCase().includes(query) ||
          card.email.toLowerCase().includes(query) ||
          card.mobileNumber.includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "name":
          compareValue = a.fullName.localeCompare(b.fullName);
          break;
        case "company":
          compareValue = a.companyName.localeCompare(b.companyName);
          break;
        case "date":
          compareValue =
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredCards(filtered);
  };

  const handleSort = (field: "name" | "company" | "date") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCardPress = (card: BusinessCard) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/card-detail",
      params: { cardId: card.id },
    });
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: "name" | "company" | "date";
    label: string;
  }) => {
    const isActive = sortBy === field;
    return (
      <Pressable
        onPress={() => handleSort(field)}
        style={({ pressed }) => ({
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: isActive ? colors.primary : colors.surface,
          opacity: pressed ? 0.7 : 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        })}
      >
        <Text
          className="text-sm font-semibold"
          style={{ color: isActive ? "#FFFFFF" : colors.foreground }}
        >
          {label}
        </Text>
        {isActive && (
          <IconSymbol
            name="chevron.right"
            size={16}
            color="#FFFFFF"
            style={{
              transform: [{ rotate: sortOrder === "asc" ? "-90deg" : "90deg" }],
            }}
          />
        )}
      </Pressable>
    );
  };

  const TableRow = ({ card, index }: { card: BusinessCard; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Pressable
        onPress={() => handleCardPress(card)}
        style={({ pressed }) => ({
          padding: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text
              className="text-base font-bold"
              style={{ color: colors.foreground }}
              numberOfLines={1}
            >
              {card.fullName}
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: colors.primary }}
              numberOfLines={1}
            >
              {card.companyName}
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </View>

        <View className="flex-row flex-wrap gap-2">
          {card.jobTitle && (
            <View
              className="px-2 py-1 rounded"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Text className="text-xs" style={{ color: colors.primary }}>
                {card.jobTitle}
              </Text>
            </View>
          )}
          {card.department && (
            <View
              className="px-2 py-1 rounded"
              style={{ backgroundColor: colors.muted + "20" }}
            >
              <Text className="text-xs" style={{ color: colors.muted }}>
                {card.department}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-2 pt-2 border-t" style={{ borderColor: colors.border }}>
          <View className="flex-row items-center gap-2">
            <IconSymbol name="phone.fill" size={14} color={colors.muted} />
            <Text className="text-xs" style={{ color: colors.muted }}>
              {card.mobileNumber}
            </Text>
          </View>
          {card.email && (
            <View className="flex-row items-center gap-2 mt-1">
              <IconSymbol name="envelope.fill" size={14} color={colors.muted} />
              <Text className="text-xs" style={{ color: colors.muted }} numberOfLines={1}>
                {card.email}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} className="px-6 pt-4 pb-3">
          <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
            {t("table.title")}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {filteredCards.length} {t("table.cards_total")}
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
              placeholder={t("home.search_placeholder")}
              placeholderTextColor={colors.muted}
              style={{ color: colors.foreground }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Sort Buttons */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="px-6 mb-4"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <SortButton field="name" label={t("table.sort_name")} />
            <SortButton field="company" label={t("table.sort_company")} />
            <SortButton field="date" label={t("table.sort_date")} />
          </ScrollView>
        </Animated.View>

        {/* Table Content */}
        {filteredCards.length === 0 ? (
          <Animated.View
            entering={FadeIn.delay(300).duration(400)}
            className="flex-1 items-center justify-center px-6"
          >
            <IconSymbol name="tray.fill" size={64} color={colors.muted} />
            <Text
              className="text-xl font-semibold mt-4"
              style={{ color: colors.foreground }}
            >
              {searchQuery ? t("home.no_results") : t("home.no_cards")}
            </Text>
            <Text className="text-sm mt-2 text-center" style={{ color: colors.muted }}>
              {searchQuery ? t("home.no_results_desc") : t("home.no_cards_desc")}
            </Text>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <TableRow card={item} index={index} />}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
