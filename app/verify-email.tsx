import { useState, useRef, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function VerifyEmailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const verifyMutation = trpc.appAuth.verifyEmail.useMutation();
  const resendMutation = trpc.appAuth.resendCode.useMutation();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, "");
    setCode(newCode);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoading(true);
    try {
      const result = await verifyMutation.mutateAsync({
        email: email || "",
        code: fullCode,
      });

      if (result.success) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert("Success", "Email verified successfully!", [
          {
            text: "Sign In",
            onPress: () => router.replace("/login" as any),
          },
        ]);
      } else {
        Alert.alert("Error", result.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error", "Failed to verify. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setResending(true);
    try {
      const result = await resendMutation.mutateAsync({
        email: email || "",
      });

      if (result.success) {
        Alert.alert("Success", "A new verification code has been sent to your email.");
      } else {
        Alert.alert("Error", result.error || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

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
          <IconSymbol name="envelope.fill" size={40} color="#3B82F6" />
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
          Verify Your Email
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
          We've sent a 6-digit verification code to{"\n"}
          <Text style={{ fontWeight: "600", color: colors.foreground }}>
            {email}
          </Text>
        </Text>

        {/* Code Input */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={{
                width: 48,
                height: 56,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: digit ? "#3B82F6" : colors.border,
                fontSize: 24,
                fontWeight: "700",
                textAlign: "center",
                color: colors.foreground,
              }}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={6}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <Pressable
          onPress={handleVerify}
          disabled={loading || code.join("").length !== 6}
          style={({ pressed }) => ({
            backgroundColor: code.join("").length === 6 ? "#3B82F6" : colors.border,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            opacity: pressed || loading ? 0.9 : 1,
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: code.join("").length === 6 ? 0.3 : 0,
            shadowRadius: 8,
            elevation: code.join("").length === 6 ? 4 : 0,
          })}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: code.join("").length === 6 ? "#FFFFFF" : colors.muted,
              }}
            >
              Verify Email
            </Text>
          )}
        </Pressable>

        {/* Resend Code */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Didn't receive the code?{" "}
          </Text>
          <Pressable onPress={handleResend} disabled={resending}>
            {resending ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  color: "#3B82F6",
                  fontWeight: "600",
                }}
              >
                Resend
              </Text>
            )}
          </Pressable>
        </View>
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
