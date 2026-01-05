import React from "react";
import { View, Text, StyleSheet, ViewStyle, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  showAnimation?: boolean;
}

export function GradientHeader({
  title,
  subtitle,
  style,
  showAnimation = true,
}: GradientHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const animationValue = useSharedValue(0);

  React.useEffect(() => {
    if (showAnimation) {
      animationValue.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [showAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationValue.value,
      [0, 0.5, 1],
      [colors.primary, "#6366F1", colors.primary]
    );
    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 10 },
        showAnimation ? animatedStyle : { backgroundColor: colors.primary },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  content: {
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  circle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: 10,
    right: 40,
  },
  circle3: {
    width: 40,
    height: 40,
    top: 20,
    left: -10,
  },
});
