import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { BusinessCard } from "@/types/business-card";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import { getApiBaseUrl } from "@/constants/oauth";

export default function ScanScreen() {
  const colors = useColors();
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const ocrMutation = trpc.ocr.extractCard.useMutation();
  
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    department: "",
    mobileNumber: "",
    phoneNumber: "",
    email: "",
  });

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to scan business cards."
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 10],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        await extractDataFromImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handlePickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 10],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        await extractDataFromImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const extractDataFromImage = async (uri: string) => {
    setExtracting(true);
    try {
      // Convert image to base64
      let base64Image: string;
      
      if (Platform.OS === "web") {
        // For web, use fetch to get base64
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } else {
        // For native, use FileSystem
        base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        base64Image = `data:image/jpeg;base64,${base64Image}`;
      }

      // Upload to S3 and get public URL
      const apiBaseUrl = getApiBaseUrl();
      const uploadResponse = await fetch(`${apiBaseUrl}/api/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image }),
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }
      
      const { imageUrl } = await uploadResponse.json();

      // Call OCR API
      const result = await ocrMutation.mutateAsync({ imageUrl });

      if (result.success && result.data) {
        setFormData(result.data);
        
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        throw new Error(result.error || "Failed to extract data");
      }
    } catch (error) {
      console.error("Error extracting data:", error);
      Alert.alert(
        "Error",
        "Failed to extract data automatically. Please enter information manually."
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.companyName || !formData.fullName || !formData.mobileNumber) {
      Alert.alert(
        "Missing Information",
        "Please fill in at least Company Name, Full Name, and Mobile Number."
      );
      return;
    }

    setSaving(true);

    try {
      const newCard: BusinessCard = {
        id: Date.now().toString(),
        ...formData,
        imageUri: imageUri || undefined,
        dateAdded: new Date().toISOString(),
      };

      await storageService.saveCard(newCard);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Success", "Business card saved successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      if (error.message === "DUPLICATE_MOBILE") {
        Alert.alert(
          "Duplicate Contact",
          "A contact with this mobile number already exists."
        );
      } else {
        Alert.alert("Error", "Failed to save card. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} className="flex-row items-center px-6 py-4">
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-bold ml-4" style={{ color: colors.foreground }}>
            Scan Business Card
          </Text>
        </Animated.View>

        {/* Camera Actions */}
        {!imageUri && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mb-6">
            <View
              className="items-center justify-center p-12 rounded-2xl mb-4"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: colors.border,
                borderStyle: "dashed",
              }}
            >
              <IconSymbol name="camera.fill" size={64} color={colors.muted} />
              <Text className="text-lg font-semibold mt-4 mb-2" style={{ color: colors.foreground }}>
                Capture Business Card
              </Text>
              <Text className="text-center text-sm mb-6" style={{ color: colors.muted }}>
                Take a photo or select from gallery
              </Text>

              <View className="w-full gap-3">
                <Pressable
                  onPress={handleTakePhoto}
                  style={({ pressed }) => ({
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <IconSymbol name="camera.fill" size={20} color="#FFFFFF" />
                  <Text className="ml-3 text-base font-semibold text-white">
                    Take Photo
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePickImage}
                  style={({ pressed }) => ({
                    backgroundColor: colors.surface,
                    borderWidth: 2,
                    borderColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <IconSymbol name="house.fill" size={20} color={colors.primary} />
                  <Text
                    className="ml-3 text-base font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Choose from Gallery
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Image Preview */}
        {imageUri && (
          <Animated.View entering={FadeIn.duration(400)} className="px-6 mb-6">
            <View className="rounded-2xl overflow-hidden mb-4">
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: "100%",
                  height: 200,
                  resizeMode: "cover",
                }}
              />
            </View>
            <Pressable
              onPress={() => setImageUri(null)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text className="text-center text-sm" style={{ color: colors.primary }}>
                Change Image
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Extracting Indicator */}
        {extracting && (
          <Animated.View entering={FadeIn.duration(300)} className="px-6 mb-6">
            <View
              className="flex-row items-center justify-center p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="ml-3 text-sm" style={{ color: colors.foreground }}>
                Extracting data from image...
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Form */}
        {imageUri && !extracting && (
          <Animated.View entering={FadeInDown.duration(400)} className="px-6 pb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
              Card Information
            </Text>

            {/* Company Name */}
            <View className="mb-4">
              <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                Company Name *
              </Text>
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
                placeholder="Enter company name"
                placeholderTextColor={colors.muted}
                value={formData.companyName}
                onChangeText={(text) => setFormData({ ...formData, companyName: text })}
              />
            </View>

            {/* Full Name */}
            <View className="mb-4">
              <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                Full Name *
              </Text>
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
                placeholder="Enter full name"
                placeholderTextColor={colors.muted}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>

            {/* First & Last Name */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                  First Name
                </Text>
                <TextInput
                  className="p-4 rounded-xl text-base"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.foreground,
                  }}
                  placeholder="First name"
                  placeholderTextColor={colors.muted}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                  Last Name
                </Text>
                <TextInput
                  className="p-4 rounded-xl text-base"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.foreground,
                  }}
                  placeholder="Last name"
                  placeholderTextColor={colors.muted}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>
            </View>

            {/* Job Title */}
            <View className="mb-4">
              <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                Job Title
              </Text>
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
                placeholder="Enter job title"
                placeholderTextColor={colors.muted}
                value={formData.jobTitle}
                onChangeText={(text) => setFormData({ ...formData, jobTitle: text })}
              />
            </View>

            {/* Department */}
            <View className="mb-4">
              <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                Department
              </Text>
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
                placeholder="Enter department"
                placeholderTextColor={colors.muted}
                value={formData.department}
                onChangeText={(text) => setFormData({ ...formData, department: text })}
              />
            </View>

            {/* Mobile Number */}
            <View className="mb-4">
              <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                Mobile Number *
              </Text>
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.muted}
                value={formData.mobileNumber}
                onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
                keyboardType="phone-pad"
              />
            </View>

            {/* Phone Number */}
            <View className="mb-4">
              <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                Phone Number
              </Text>
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
                placeholder="Enter phone number"
                placeholderTextColor={colors.muted}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View className="mb-6">
              <Text className="text-xs mb-2 font-semibold" style={{ color: colors.muted }}>
                Email Address
              </Text>
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
                placeholder="Enter email address"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                padding: 18,
                borderRadius: 12,
                alignItems: "center",
                opacity: pressed || saving ? 0.8 : 1,
              })}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">Save Business Card</Text>
              )}
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
