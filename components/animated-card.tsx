import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { BusinessCard } from "@/types/business-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface AnimatedCardProps {
  card: BusinessCard;
  index: number;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedCard({ card, index, onPress, onLongPress }: AnimatedCardProps) {
  const colors = useColors();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  
  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };
  
  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress?.();
  };
  
  // Get initials for avatar
  const getInitials = () => {
    const name = card.fullName || `${card.firstName} ${card.lastName}`;
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Generate avatar color based on name
  const getAvatarColor = () => {
    const name = card.fullName || card.companyName || "";
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.foreground,
          },
        ]}
      >
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            { backgroundColor: getAvatarColor() },
          ]}
        >
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.name, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {card.fullName || `${card.firstName} ${card.lastName}`}
          </Text>
          
          <Text
            style={[styles.company, { color: colors.primary }]}
            numberOfLines={1}
          >
            {card.companyName}
          </Text>
          
          {card.jobTitle && (
            <Text
              style={[styles.jobTitle, { color: colors.muted }]}
              numberOfLines={1}
            >
              {card.jobTitle}
            </Text>
          )}
          
          {card.department && (
            <View style={styles.departmentRow}>
              <IconSymbol name="building.2" size={12} color={colors.muted} />
              <Text
                style={[styles.department, { color: colors.muted }]}
                numberOfLines={1}
              >
                {card.department}
              </Text>
            </View>
          )}
        </View>
        
        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <IconSymbol name="chevron.right" size={16} color={colors.muted} />
        </View>
        
        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {card.tags.slice(0, 2).map((tag, i) => (
              <View
                key={i}
                style={[
                  styles.tag,
                  {
                    backgroundColor:
                      tag === "VIP"
                        ? "#FFD700"
                        : tag === "Important"
                        ? "#FF6B6B"
                        : tag === "Follow-up"
                        ? "#4ECDC4"
                        : colors.primary,
                  },
                ]}
              >
                <Text style={styles.tagText}>
                  {tag === "VIP" ? "VIP" : tag === "Important" ? "!" : "↻"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  departmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  department: {
    fontSize: 11,
  },
  arrowContainer: {
    padding: 4,
  },
  tagsContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  tag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
