import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const forgotMutation = trpc.appAuth.forgotPassword.useMutation();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoading(true);
    try {
      const result = await forgotMutation.mutateAsync({
        email: email.trim(),
      });

      if (result.success) {
        setSent(true);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Alert.alert("Error", "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ScreenContainer>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            flex: 1,
            paddingHorizontal: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#10B98115",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <IconSymbol name="checkmark" size={50} color="#10B981" />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.foreground,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Check Your Email
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 32,
            }}
          >
            If an account exists with{" "}
            <Text style={{ fontWeight: "600", color: colors.foreground }}>
              {email}
            </Text>
            , you will receive a password reset link shortly.
          </Text>

          <Pressable
            onPress={() => router.replace("/login" as any)}
            style={({ pressed }) => ({
              backgroundColor: "#3B82F6",
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 48,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              Back to Sign In
            </Text>
          </Pressable>
        </Animated.View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            padding: 4,
          })}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 40, height: 40, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View>
        <View style={{ width: 32 }} />
      </Animated.View>

      {/* Content */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={{ paddingHorizontal: 24, flex: 1 }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: "#3B82F615",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            marginBottom: 24,
          }}
        >
          <IconSymbol name="lock.fill" size={40} color="#3B82F6" />
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: colors.foreground,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Forgot Password?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 20,
          }}
        >
          Enter your email address and we'll send you{"\n"}a link to reset your
          password.
        </Text>

        {/* Email Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            Email Address
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

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading || !email.trim()}
          style={({ pressed }) => ({
            backgroundColor: email.trim() ? "#3B82F6" : colors.border,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            opacity: pressed || loading ? 0.9 : 1,
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: email.trim() ? 0.3 : 0,
            shadowRadius: 8,
            elevation: email.trim() ? 4 : 0,
          })}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: email.trim() ? "#FFFFFF" : colors.muted,
              }}
            >
              Send Reset Link
            </Text>
          )}
        </Pressable>

        {/* Back to Login */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            alignItems: "center",
            marginTop: 24,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: "#3B82F6", fontWeight: "600" }}>
            Back to Sign In
          </Text>
        </Pressable>
      </Animated.View>

      {/* Footer */}
      <View style={{ alignItems: "center", paddingVertical: 32 }}>
        <Text style={{ fontSize: 11, color: colors.muted }}>
          Powered by DSOX
        </Text>
      </View>
    </ScreenContainer>
  );
}
