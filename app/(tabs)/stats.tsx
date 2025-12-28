import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import { storageService } from "@/lib/storage";
import { BusinessCard, CardStats } from "@/types/business-card";
import { useEffect, useState } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function StatsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const [stats, setStats] = useState<CardStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const cards = await storageService.getAllCards();
    const calculatedStats = calculateStats(cards);
    setStats(calculatedStats);
  };

  const calculateStats = (cards: BusinessCard[]): CardStats => {
    const companies = new Map<string, number>();
    const departments = new Map<string, number>();
    let vipCount = 0;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let recentCount = 0;

    cards.forEach((card) => {
      // Count companies
      if (card.companyName) {
        companies.set(card.companyName, (companies.get(card.companyName) || 0) + 1);
      }

      // Count departments
      if (card.department) {
        departments.set(card.department, (departments.get(card.department) || 0) + 1);
      }

      // Count VIP
      if (card.tags?.includes("VIP")) {
        vipCount++;
      }

      // Count recent (last 30 days)
      const cardDate = new Date(card.dateAdded).getTime();
      if (cardDate >= thirtyDaysAgo) {
        recentCount++;
      }
    });

    // Get top 5 companies
    const topCompanies = Array.from(companies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Get top 5 departments
    const topDepartments = Array.from(departments.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalCards: cards.length,
      companiesCount: companies.size,
      departmentsCount: departments.size,
      vipCount,
      recentCount,
      topCompanies,
      topDepartments,
    };
  };

  const StatCard = ({
    icon,
    label,
    value,
    color,
    delay = 0,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    delay?: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      className="flex-1 min-w-[45%]"
      style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: color + "20" }}
      >
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <Text className="text-2xl font-bold mb-1" style={{ color: colors.foreground }}>
        {value}
      </Text>
      <Text className="text-sm" style={{ color: colors.muted }}>
        {label}
      </Text>
    </Animated.View>
  );

  const ListItem = ({ name, count, delay = 0 }: { name: string; count: number; delay?: number }) => (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      className="flex-row items-center justify-between py-3 px-4 mb-2"
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text className="text-base flex-1" style={{ color: colors.foreground }}>
        {name}
      </Text>
      <View
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: colors.primary + "20" }}
      >
        <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
          {count}
        </Text>
      </View>
    </Animated.View>
  );

  if (!stats) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.muted }}>Loading stats...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} className="px-6 pt-4 pb-3">
          <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
            {t("stats.title")}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {t("stats.subtitle")}
          </Text>
        </Animated.View>

        {/* Stats Cards */}
        <View className="px-6 mt-4">
          <View className="flex-row flex-wrap gap-3">
            <StatCard
              icon="tray.fill"
              label={t("stats.total_cards")}
              value={stats.totalCards}
              color={colors.primary}
              delay={100}
            />
            <StatCard
              icon="house.fill"
              label={t("stats.companies")}
              value={stats.companiesCount}
              color="#6C5CE7"
              delay={150}
            />
            <StatCard
              icon="person.fill"
              label={t("stats.vip_contacts")}
              value={stats.vipCount}
              color="#FF6B6B"
              delay={200}
            />
            <StatCard
              icon="checkmark"
              label={t("stats.recent_30_days")}
              value={stats.recentCount}
              color="#00B894"
              delay={250}
            />
          </View>
        </View>

        {/* Top Companies */}
        {stats.topCompanies.length > 0 && (
          <View className="px-6 mt-6">
            <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
              {t("stats.top_companies")}
            </Text>
            {stats.topCompanies.map((company, index) => (
              <ListItem
                key={company.name}
                name={company.name}
                count={company.count}
                delay={300 + index * 50}
              />
            ))}
          </View>
        )}

        {/* Top Departments */}
        {stats.topDepartments.length > 0 && (
          <View className="px-6 mt-6 mb-6">
            <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
              {t("stats.top_departments")}
            </Text>
            {stats.topDepartments.map((dept, index) => (
              <ListItem
                key={dept.name}
                name={dept.name}
                count={dept.count}
                delay={500 + index * 50}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
