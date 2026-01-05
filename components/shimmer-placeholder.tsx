import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface ShimmerPlaceholderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ShimmerPlaceholder({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: ShimmerPlaceholderProps) {
  const colors = useColors();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerValue.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function CardShimmer() {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Avatar */}
      <ShimmerPlaceholder width={50} height={50} borderRadius={25} />

      {/* Content */}
      <View style={styles.content}>
        <ShimmerPlaceholder width="70%" height={16} />
        <ShimmerPlaceholder width="50%" height={14} style={{ marginTop: 8 }} />
        <ShimmerPlaceholder width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function CardListShimmer({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <CardShimmer key={index} />
      ))}
    </View>
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
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
});
