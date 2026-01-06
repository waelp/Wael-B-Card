import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { storageService } from "@/lib/storage";
import { BusinessCard } from "@/types/business-card";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface DashboardStats {
  totalCards: number;
  companiesCount: number;
  departmentsCount: number;
  recentCards: BusinessCard[];
  topCompanies: { name: string; count: number }[];
}

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCards: 0,
    companiesCount: 0,
    departmentsCount: 0,
    recentCards: [],
    topCompanies: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation values
  const headerScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 12 });
    cardOpacity.value = withTiming(1, { duration: 600 });
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const cards = await storageService.getAllCards();
      
      // Calculate statistics
      const companies = new Set(cards.map(c => c.companyName).filter(Boolean));
      const departments = new Set(cards.map(c => c.department).filter(Boolean));
      
      // Get top companies
      const companyCount: Record<string, number> = {};
      cards.forEach(card => {
        if (card.companyName) {
          companyCount[card.companyName] = (companyCount[card.companyName] || 0) + 1;
        }
      });
      
      const topCompanies = Object.entries(companyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Get recent cards (last 5)
      const recentCards = [...cards]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5);

      setStats({
        totalCards: cards.length,
        companiesCount: companies.size,
        departmentsCount: departments.size,
        recentCards,
        topCompanies,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const navigateToSearch = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/(tabs)");
  };

  const navigateToScan = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/scan");
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    delay 
  }: { 
    title: string; 
    value: number; 
    icon: string; 
    color: string;
    delay: number;
  }) => (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400).springify()}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 6,
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: `${color}15`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <IconSymbol name={icon as any} size={22} color={color} />
      </View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: colors.foreground,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: colors.muted,
          fontWeight: "500",
        }}
      >
        {title}
      </Text>
    </Animated.View>
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6", "#06B6D4"]}
          />
        }
      >
        {/* Header */}
        <Animated.View style={headerAnimatedStyle}>
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  overflow: "hidden",
                  marginRight: 12,
                }}
              >
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={{ width: 48, height: 48 }}
                  resizeMode="cover"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: colors.foreground,
                    letterSpacing: -0.5,
                  }}
                >
                  Dashboard
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#06B6D4",
                    fontWeight: "600",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  BizCapture by DSOX
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{ paddingHorizontal: 24, marginBottom: 24 }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={navigateToScan}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: "#3B82F6",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.9 : 1,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              <IconSymbol name="camera.fill" size={20} color="#FFFFFF" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                Capture
              </Text>
            </Pressable>

            <Pressable
              onPress={navigateToSearch}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <IconSymbol name="magnifyingglass" size={20} color="#3B82F6" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#3B82F6",
                }}
              >
                Search
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <View style={{ paddingHorizontal: 18, marginBottom: 24 }}>
          <View style={{ flexDirection: "row" }}>
            <StatCard
              title="Total Cards"
              value={stats.totalCards}
              icon="creditcard.fill"
              color="#3B82F6"
              delay={150}
            />
            <StatCard
              title="Companies"
              value={stats.companiesCount}
              icon="building.2.fill"
              color="#06B6D4"
              delay={200}
            />
            <StatCard
              title="Departments"
              value={stats.departmentsCount}
              icon="briefcase.fill"
              color="#8B5CF6"
              delay={250}
            />
          </View>
        </View>

        {/* Top Companies */}
        {stats.topCompanies.length > 0 && (
          <Animated.View
            entering={SlideInLeft.delay(300).duration(400)}
            style={{ paddingHorizontal: 24, marginBottom: 24 }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 16,
              }}
            >
              Top Companies
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {stats.topCompanies.map((company, index) => (
                <View
                  key={company.name}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: index < stats.topCompanies.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: `#3B82F6${15 + index * 10}`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#3B82F6",
                      }}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "500",
                      color: colors.foreground,
                    }}
                    numberOfLines={1}
                  >
                    {company.name}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#3B82F615",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#3B82F6",
                      }}
                    >
                      {company.count}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Recent Cards */}
        {stats.recentCards.length > 0 && (
          <Animated.View
            entering={SlideInRight.delay(350).duration(400)}
            style={{ paddingHorizontal: 24, marginBottom: 32 }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 16,
              }}
            >
              Recent Cards
            </Text>
            {stats.recentCards.map((card, index) => (
              <Pressable
                key={card.id}
                onPress={() => router.push({ pathname: "/card-detail", params: { cardId: card.id } })}
                style={({ pressed }) => ({
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "#3B82F615",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#3B82F6",
                    }}
                  >
                    {card.fullName?.charAt(0) || "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.foreground,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                  >
                    {card.fullName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.muted,
                    }}
                    numberOfLines={1}
                  >
                    {card.companyName} • {card.jobTitle}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Empty State */}
        {stats.totalCards === 0 && !loading && (
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={{
              alignItems: "center",
              paddingHorizontal: 32,
              paddingVertical: 48,
            }}
          >
            <Animated.View style={pulseAnimatedStyle}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 25,
                  backgroundColor: "#3B82F610",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <IconSymbol name="creditcard.fill" size={48} color="#3B82F6" />
              </View>
            </Animated.View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No cards yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              Start capturing business cards to see your statistics and insights here
            </Text>
            <Pressable
              onPress={navigateToScan}
              style={({ pressed }) => ({
                backgroundColor: "#3B82F6",
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 14,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                Capture First Card
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Footer */}
        <View style={{ alignItems: "center", paddingBottom: 32 }}>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
              letterSpacing: 0.5,
            }}
          >
            Powered by DSOX
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
