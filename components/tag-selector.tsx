import { View, Text, Pressable, Platform } from "react-native";
import { CardTag } from "@/types/business-card";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import * as Haptics from "expo-haptics";

interface TagSelectorProps {
  selectedTags: CardTag[];
  onTagsChange: (tags: CardTag[]) => void;
}

const TAG_COLORS: Record<CardTag, string> = {
  VIP: "#FF6B6B",
  "Follow-up": "#4ECDC4",
  Important: "#FFD93D",
  Partner: "#6C5CE7",
  Client: "#00B894",
};

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const colors = useColors();
  const { t } = useI18n();

  const allTags: CardTag[] = ["VIP", "Follow-up", "Important", "Partner", "Client"];

  const toggleTag = (tag: CardTag) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const isSelected = selectedTags.includes(tag);
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {allTags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        const tagColor = TAG_COLORS[tag];

        return (
          <Pressable
            key={tag}
            onPress={() => toggleTag(tag)}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: isSelected ? tagColor : colors.surface,
              borderWidth: 1,
              borderColor: isSelected ? tagColor : colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              className="text-xs font-semibold"
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
  );
}

interface TagBadgeProps {
  tag: CardTag;
  size?: "sm" | "md";
}

export function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  const tagColor = TAG_COLORS[tag];
  const padding = size === "sm" ? 4 : 6;
  const fontSize = size === "sm" ? 10 : 12;

  return (
    <View
      style={{
        paddingHorizontal: padding * 2,
        paddingVertical: padding,
        borderRadius: 12,
        backgroundColor: tagColor,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize,
          fontWeight: "600",
        }}
      >
        {tag}
      </Text>
    </View>
  );
}
