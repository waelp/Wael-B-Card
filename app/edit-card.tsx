import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { BusinessCard } from "@/types/business-card";
import { exportService } from "@/lib/export-service";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function EditCardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    setLoading(true);
    try {
      const cards = await storageService.getAllCards();
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        setFullName(card.fullName || "");
        setFirstName(card.firstName || "");
        setLastName(card.lastName || "");
        setJobTitle(card.jobTitle || "");
        setDepartment(card.department || "");
        setCompanyName(card.companyName || "");
        setMobileNumber(card.mobileNumber || "");
        setPhoneNumber(card.phoneNumber || "");
        setEmail(card.email || "");
        setWebsite(card.website || "");
        setAddress(card.address || "");
        setNotes(card.notes || "");
      }
    } catch (error) {
      console.error("Error loading card:", error);
      Alert.alert("Error", "Failed to load card details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim() && !firstName.trim() && !lastName.trim()) {
      Alert.alert("Error", "Please enter at least a name");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setSaving(true);
    try {
      const cards = await storageService.getAllCards();
      const existingCard = cards.find((c) => c.id === cardId);
      
      if (!existingCard) {
        throw new Error("Card not found");
      }

      // Update card
      const updatedCard: BusinessCard = {
        ...existingCard,
        fullName: fullName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim(),
        companyName: companyName.trim(),
        mobileNumber: mobileNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        website: website.trim(),
        address: address.trim(),
        notes: notes.trim(),
      };

      await storageService.updateCard(cardId!, updatedCard);

      // Auto-export to Excel after update
      try {
        const updatedCards = await storageService.getAllCards();
        await exportService.exportToExcel(updatedCards);
      } catch (exportError) {
        console.error("Auto-export failed:", exportError);
        // Don't block the save if export fails
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Success", "Card updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving card:", error);
      Alert.alert("Error", "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.muted }}>
            Loading...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            padding: 4,
          })}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </Pressable>
        
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
          Edit Card
        </Text>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => ({
            backgroundColor: "#3B82F6",
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 8,
            opacity: pressed || saving ? 0.8 : 1,
          })}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>
              Save
            </Text>
          )}
        </Pressable>
      </Animated.View>

      {/* Form */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ gap: 20 }}>
          {/* Personal Information */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
              Personal Information
            </Text>
            
            <InputField
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              colors={colors}
            />
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  colors={colors}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  colors={colors}
                />
              </View>
            </View>
          </View>

          {/* Professional Information */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
              Professional Information
            </Text>
            
            <InputField
              label="Job Title"
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="Enter job title"
              colors={colors}
            />
            
            <InputField
              label="Department"
              value={department}
              onChangeText={setDepartment}
              placeholder="Enter department"
              colors={colors}
            />
            
            <InputField
              label="Company Name"
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter company name"
              colors={colors}
            />
          </View>

          {/* Contact Information */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
              Contact Information
            </Text>
            
            <InputField
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              colors={colors}
            />
            
            <InputField
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              colors={colors}
            />
            
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
            />
            
            <InputField
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="Enter website URL"
              keyboardType="url"
              autoCapitalize="none"
              colors={colors}
            />
          </View>

          {/* Additional Information */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
              Additional Information
            </Text>
            
            <InputField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
              colors={colors}
            />
            
            <InputField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter notes"
              multiline
              numberOfLines={4}
              colors={colors}
            />
          </View>

          {/* Save Button (bottom) */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => ({
              backgroundColor: "#3B82F6",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 8,
              marginBottom: 32,
              opacity: pressed || saving ? 0.8 : 1,
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#FFFFFF" }}>
                Save Changes
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

// Input Field Component
function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  multiline?: boolean;
  numberOfLines?: number;
  colors: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 14,
          fontSize: 16,
          color: colors.foreground,
          minHeight: multiline ? (numberOfLines || 1) * 24 + 24 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}
