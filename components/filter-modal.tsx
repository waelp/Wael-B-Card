import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import type { FilterState, DateRange } from "@/types/filter";
import type { CardTag } from "@/types/business-card";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  companies: string[];
  departments: string[];
  tags: CardTag[];
}

export function FilterModal({
  visible,
  onClose,
  filters,
  onApply,
  companies,
  departments,
  tags,
}: FilterModalProps) {
  const colors = useColors();
  const { t } = useI18n();

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalFilters({
      company: undefined,
      department: undefined,
      dateRange: "all",
      tags: [],
    });
  };

  const dateRanges: DateRange[] = ["all", "today", "week", "month", "year"];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="rounded-t-3xl"
          style={{
            backgroundColor: colors.background,
            height: "75%",
            minHeight: 500,
          }}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-6 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <Text
              className="text-xl font-bold"
              style={{ color: colors.foreground }}
            >
              {t("filter.title")}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="house.fill" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView 
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Company Filter */}
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                {t("filter.company")}
              </Text>
              <View
                className="flex-row flex-wrap gap-2"
                style={{ rowGap: 8, columnGap: 8 }}
              >
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setLocalFilters({ ...localFilters, company: undefined });
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: !localFilters.company
                      ? colors.primary
                      : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: !localFilters.company
                        ? "#FFFFFF"
                        : colors.foreground,
                    }}
                  >
                    {t("filter.all")}
                  </Text>
                </Pressable>
                {companies.map((company) => (
                  <Pressable
                    key={company}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setLocalFilters({ ...localFilters, company });
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor:
                        localFilters.company === company
                          ? colors.primary
                          : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color:
                          localFilters.company === company
                            ? "#FFFFFF"
                            : colors.foreground,
                      }}
                    >
                      {company}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Department Filter */}
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                {t("filter.department")}
              </Text>
              <View
                className="flex-row flex-wrap gap-2"
                style={{ rowGap: 8, columnGap: 8 }}
              >
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setLocalFilters({ ...localFilters, department: undefined });
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: !localFilters.department
                      ? colors.primary
                      : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: !localFilters.department
                        ? "#FFFFFF"
                        : colors.foreground,
                    }}
                  >
                    {t("filter.all")}
                  </Text>
                </Pressable>
                {departments.map((dept) => (
                  <Pressable
                    key={dept}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setLocalFilters({ ...localFilters, department: dept });
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor:
                        localFilters.department === dept
                          ? colors.primary
                          : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color:
                          localFilters.department === dept
                            ? "#FFFFFF"
                            : colors.foreground,
                      }}
                    >
                      {dept}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Tags Filter */}
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                {t("filter.tags")}
              </Text>
              <View
                className="flex-row flex-wrap gap-2"
                style={{ rowGap: 8, columnGap: 8 }}
              >
                {tags.map((tag) => {
                  const isSelected = localFilters.tags?.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        const currentTags = localFilters.tags || [];
                        const newTags = isSelected
                          ? currentTags.filter((t) => t !== tag)
                          : [...currentTags, tag];
                        setLocalFilters({ ...localFilters, tags: newTags });
                      }}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surface,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        className="text-sm"
                        style={{
                          color: isSelected ? "#FFFFFF" : colors.foreground,
                        }}
                      >
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Date Range Filter */}
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                {t("filter.date_range")}
              </Text>
              <View
                className="flex-row flex-wrap gap-2"
                style={{ rowGap: 8, columnGap: 8 }}
              >
                {dateRanges.map((range) => (
                  <Pressable
                    key={range}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setLocalFilters({ ...localFilters, dateRange: range });
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor:
                        localFilters.dateRange === range
                          ? colors.primary
                          : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color:
                          localFilters.dateRange === range
                            ? "#FFFFFF"
                            : colors.foreground,
                      }}
                    >
                      {t(`filter.date_${range}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            className="flex-row gap-3 px-6 py-4 border-t"
            style={{ borderTopColor: colors.border }}
          >
            <Pressable
              onPress={handleClear}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: colors.foreground }}
              >
                {t("filter.clear")}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
                {t("filter.apply")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
