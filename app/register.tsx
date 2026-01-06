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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerMutation = trpc.appAuth.register.useMutation();

  // Password requirements
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!isPasswordValid) {
      Alert.alert("Error", "Please meet all password requirements");
      return;
    }
    if (!passwordsMatch) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoading(true);
    try {
      const result = await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
      });

      if (result.success) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert(
          "Registration Successful",
          "Please check your email for the verification code.",
          [
            {
              text: "OK",
              onPress: () =>
                router.push({
                  pathname: "/verify-email" as any,
                  params: { email: email.trim() },
                }),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
      <IconSymbol
        name={met ? "checkmark" : "xmark"}
        size={14}
        color={met ? "#10B981" : colors.muted}
      />
      <Text
        style={{
          marginLeft: 6,
          fontSize: 12,
          color: met ? "#10B981" : colors.muted,
        }}
      >
        {text}
      </Text>
    </View>
  );

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

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={{ paddingHorizontal: 24 }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 8,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                marginBottom: 24,
              }}
            >
              Join BizCapture to manage your business cards
            </Text>

            {/* Full Name */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Full Name *
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
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.muted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Email *
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

            {/* Phone Number */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Phone Number (Optional)
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
                <IconSymbol name="phone.fill" size={20} color={colors.muted} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.muted}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Password *
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
                  placeholder="Create a password"
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

              {/* Password Requirements */}
              {password.length > 0 && (
                <View style={{ marginTop: 12, paddingLeft: 4 }}>
                  <PasswordRequirement met={hasMinLength} text="At least 6 characters" />
                  <PasswordRequirement met={hasUppercase} text="One uppercase letter (A-Z)" />
                  <PasswordRequirement met={hasLowercase} text="One lowercase letter (a-z)" />
                  <PasswordRequirement met={hasNumber} text="One number (0-9)" />
                  <PasswordRequirement met={hasSpecial} text="One special character (!@#$%...)" />
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Confirm Password *
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: confirmPassword.length > 0 
                    ? passwordsMatch ? "#10B981" : "#EF4444"
                    : colors.border,
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
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                {confirmPassword.length > 0 && (
                  <IconSymbol
                    name={passwordsMatch ? "checkmark" : "xmark"}
                    size={20}
                    color={passwordsMatch ? "#10B981" : "#EF4444"}
                  />
                )}
              </View>
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={loading || !isPasswordValid || !passwordsMatch}
              style={({ pressed }) => ({
                backgroundColor:
                  isPasswordValid && passwordsMatch ? "#3B82F6" : colors.border,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed || loading ? 0.9 : 1,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isPasswordValid && passwordsMatch ? 0.3 : 0,
                shadowRadius: 8,
                elevation: isPasswordValid && passwordsMatch ? 4 : 0,
              })}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: isPasswordValid && passwordsMatch ? "#FFFFFF" : colors.muted,
                  }}
                >
                  Create Account
                </Text>
              )}
            </Pressable>

            {/* Login Link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <Text style={{ fontSize: 15, color: colors.muted }}>
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push("/login" as any)}>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#3B82F6",
                    fontWeight: "600",
                  }}
                >
                  Sign In
                </Text>
              </Pressable>
            </View>
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
