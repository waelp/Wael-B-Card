import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { ImportService, ImportResult } from "@/lib/import-service";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, SlideInUp } from "react-native-reanimated";

export default function ImportScreen() {
  const colors = useColors();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [csvContent, setCsvContent] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [replaceDuplicates, setReplaceDuplicates] = useState(false);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handlePickFile = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/vnd.ms-excel", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      
      // Read file content
      let content: string;
      if (Platform.OS === "web") {
        const response = await fetch(file.uri);
        content = await response.text();
      } else {
        content = await FileSystem.readAsStringAsync(file.uri);
      }

      await processImport(content);
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to read file. Please try again.");
    }
  };

  const handleManualImport = async () => {
    if (!csvContent.trim()) {
      Alert.alert("Error", "Please paste CSV content first");
      return;
    }
    await processImport(csvContent);
  };

  const processImport = async (content: string) => {
    setImporting(true);
    setResult(null);

    try {
      const importResult = await ImportService.importFromCSV(content, {
        skipDuplicates,
        replaceDuplicates,
      });

      setResult(importResult);

      if (Platform.OS !== "web") {
        if (importResult.imported > 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert("Error", "Failed to import data. Please check the file format.");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = ImportService.getCSVTemplate();
    Alert.alert(
      "CSV Template",
      "Copy this template and fill in your data:\n\n" + template,
      [{ text: "OK" }]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} className="flex-row items-center px-6 py-4">
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              padding: 4,
            })}
          >
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-bold ml-4" style={{ color: colors.foreground }}>
            Import Cards
          </Text>
        </Animated.View>

        {/* Instructions */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mb-6">
          <View
            style={{
              backgroundColor: "#3B82F610",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#3B82F630",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <IconSymbol name="doc.badge.plus" size={20} color="#3B82F6" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                Import from CSV/Excel
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
              Upload a CSV file or paste CSV content to import multiple business cards at once.
              The file should include columns for: Company, Name, Title, Department, Mobile, Phone, Email.
            </Text>
          </View>
        </Animated.View>

        {/* Options */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} className="px-6 mb-6">
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            Import Options
          </Text>
          
          <Pressable
            onPress={() => {
              setSkipDuplicates(!skipDuplicates);
              if (!skipDuplicates) setReplaceDuplicates(false);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: skipDuplicates ? "#3B82F6" : colors.border,
                backgroundColor: skipDuplicates ? "#3B82F6" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {skipDuplicates && (
                <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={{ marginLeft: 12, fontSize: 15, color: colors.foreground }}>
              Skip duplicate entries
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setReplaceDuplicates(!replaceDuplicates);
              if (!replaceDuplicates) setSkipDuplicates(false);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: replaceDuplicates ? "#3B82F6" : colors.border,
                backgroundColor: replaceDuplicates ? "#3B82F6" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {replaceDuplicates && (
                <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={{ marginLeft: 12, fontSize: 15, color: colors.foreground }}>
              Replace duplicates with new data
            </Text>
          </Pressable>
        </Animated.View>

        {/* Upload Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} className="px-6 mb-6">
          <Pressable
            onPress={handlePickFile}
            disabled={importing}
            style={({ pressed }) => ({
              backgroundColor: "#3B82F6",
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
              opacity: pressed || importing ? 0.9 : 1,
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            {importing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol name="arrow.down.doc.fill" size={32} color="#FFFFFF" />
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 17,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  Select CSV/Excel File
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: "#FFFFFF90",
                  }}
                >
                  Tap to browse files
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Manual Input Toggle */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} className="px-6 mb-4">
          <Pressable
            onPress={() => setShowManualInput(!showManualInput)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 14, color: "#3B82F6", fontWeight: "600" }}>
              {showManualInput ? "Hide manual input" : "Or paste CSV content manually"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Manual Input */}
        {showManualInput && (
          <Animated.View entering={SlideInUp.duration(300)} className="px-6 mb-6">
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                minHeight: 150,
                fontSize: 14,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                textAlignVertical: "top",
              }}
              placeholder="Paste CSV content here..."
              placeholderTextColor={colors.muted}
              multiline
              value={csvContent}
              onChangeText={setCsvContent}
            />
            <Pressable
              onPress={handleManualImport}
              disabled={importing || !csvContent.trim()}
              style={({ pressed }) => ({
                backgroundColor: csvContent.trim() ? "#06B6D4" : colors.border,
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                marginTop: 12,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: csvContent.trim() ? "#FFFFFF" : colors.muted,
                }}
              >
                Import from Text
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Template Download */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} className="px-6 mb-6">
          <Pressable
            onPress={downloadTemplate}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <IconSymbol name="tablecells" size={20} color={colors.muted} />
            <Text style={{ marginLeft: 8, fontSize: 14, color: colors.muted }}>
              View CSV Template
            </Text>
          </Pressable>
        </Animated.View>

        {/* Result */}
        {result && (
          <Animated.View entering={FadeIn.duration(400)} className="px-6 mb-6">
            <View
              style={{
                backgroundColor: result.imported > 0 ? "#10B98115" : "#F5920B15",
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: result.imported > 0 ? "#10B98130" : "#F5920B30",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <IconSymbol
                  name={result.imported > 0 ? "checkmark" : "exclamationmark.triangle.fill"}
                  size={24}
                  color={result.imported > 0 ? "#10B981" : "#F59E0B"}
                />
                <Text
                  style={{
                    marginLeft: 10,
                    fontSize: 17,
                    fontWeight: "700",
                    color: colors.foreground,
                  }}
                >
                  Import Complete
                </Text>
              </View>
              
              <Text
                style={{
                  fontSize: 15,
                  color: colors.foreground,
                  marginBottom: 16,
                }}
              >
                {result.message}
              </Text>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, color: colors.muted }}>Imported:</Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#10B981" }}>
                    {result.imported}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, color: colors.muted }}>Duplicates:</Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#F59E0B" }}>
                    {result.duplicates}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, color: colors.muted }}>Errors:</Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#EF4444" }}>
                    {result.errors}
                  </Text>
                </View>
              </View>

              {result.imported > 0 && (
                <Pressable
                  onPress={() => router.replace("/(tabs)")}
                  style={({ pressed }) => ({
                    backgroundColor: "#3B82F6",
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                    marginTop: 16,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>
                    View Cards
                  </Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        {/* Footer */}
        <View style={{ alignItems: "center", paddingBottom: 32 }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            Powered by DSOX
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
