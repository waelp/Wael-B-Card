import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeInDown, SlideInUp } from "react-native-reanimated";

const AUTH_USER_KEY = "@bizcapture_user";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.appAuth.login.useMutation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      if (result.success && result.user) {
        // Save user to storage
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
        
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        router.replace("/(tabs)/dashboard");
      } else {
        Alert.alert("Error", result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password" as any);
  };

  const handleRegister = () => {
    router.push("/register" as any);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeIn.duration(400)}
            style={{
              alignItems: "center",
              paddingTop: 60,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 20,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.foreground,
                letterSpacing: -0.5,
              }}
            >
              BizCapture
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#06B6D4",
                fontWeight: "600",
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              by DSOX
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={{ paddingHorizontal: 24 }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 24,
              }}
            >
              Welcome Back
            </Text>

            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                }}
              >
                <IconSymbol name="envelope.fill" size={20} color={colors.muted} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                }}
              >
                <IconSymbol name="lock.fill" size={20} color={colors.muted} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <IconSymbol
                    name={showPassword ? "eye.slash.fill" : "eye.fill"}
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <Pressable
              onPress={handleForgotPassword}
              style={({ pressed }) => ({
                alignSelf: "flex-end",
                marginBottom: 24,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#3B82F6",
                  fontWeight: "600",
                }}
              >
                Forgot Password?
              </Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor: "#3B82F6",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed || loading ? 0.9 : 1,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  Sign In
                </Text>
              )}
            </Pressable>

            {/* Register Link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <Text style={{ fontSize: 15, color: colors.muted }}>
                Don't have an account?{" "}
              </Text>
              <Pressable onPress={handleRegister}>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#3B82F6",
                    fontWeight: "600",
                  }}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Skip Login */}
            <Pressable
              onPress={() => router.replace("/(tabs)/dashboard")}
              style={({ pressed }) => ({
                alignItems: "center",
                marginTop: 32,
                paddingVertical: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 14, color: colors.muted }}>
                Continue without account
              </Text>
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ fontSize: 11, color: colors.muted }}>
              Powered by DSOX
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
