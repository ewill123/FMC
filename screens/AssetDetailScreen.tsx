import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  useColorScheme,
  StatusBar,
  Animated,
} from "react-native";
import { Text, Card, Divider } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "AssetDetail">;

const { width } = Dimensions.get("window");
const MAX_DEPRECIATION_YEARS = 3;

export default function AssetDetailScreen({ route }: Props) {
  const { asset } = route.params;
  const isDarkMode = useColorScheme() === "dark";

  const themeColors = {
    background: isDarkMode ? "#121212" : "#f9f9f9",
    cardBackground: isDarkMode ? "#1e1e1e" : "#fff",
    text: isDarkMode ? "#fff" : "#222",
    subtitle: isDarkMode ? "#aaa" : "#555",
    accent: isDarkMode ? "#bb86fc" : "#6200ee",
    divider: isDarkMode ? "#333" : "#eee",
  };

  // Depreciation calculation
  const calculateDepreciation = () => {
    if (!asset.purchase_date) return 0;
    const purchase = new Date(asset.purchase_date);
    const now = new Date();
    const diffYears =
      (now.getTime() - purchase.getTime()) / 1000 / 60 / 60 / 24 / 365;
    return Math.min(
      Math.round((diffYears / MAX_DEPRECIATION_YEARS) * 100),
      100
    );
  };

  const depreciationValue = calculateDepreciation();

  // Color based on depreciation
  const getDepreciationColor = () => {
    if (depreciationValue < 40) return "#4CAF50"; // green
    if (depreciationValue < 70) return "#FF9800"; // orange
    return "#F44336"; // red
  };

  // Remaining time
  const getRemainingTime = () => {
    if (!asset.purchase_date) return "-";
    const purchase = new Date(asset.purchase_date);
    const maxDate = new Date(purchase);
    maxDate.setFullYear(maxDate.getFullYear() + MAX_DEPRECIATION_YEARS);
    const now = new Date();
    const diff = maxDate.getTime() - now.getTime();
    const days = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
    return `${days} day${days !== 1 ? "s" : ""} remaining`;
  };

  // Animated Depreciation
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: depreciationValue,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [depreciationValue]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Safe top spacing */}
      <View style={{ height: 40 }} />

      {/* Asset Image */}
      <Card
        style={[
          styles.imageCard,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {asset.image_urls && asset.image_urls.length > 0 ? (
            asset.image_urls.map((url: string, idx: number) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={styles.topImage}
                resizeMode="cover"
              />
            ))
          ) : (
            <Image
              source={{
                uri: "https://via.placeholder.com/400x220?text=No+Image",
              }}
              style={styles.topImage}
              resizeMode="cover"
            />
          )}
        </ScrollView>
      </Card>

      {/* Asset Info Card */}
      <Card
        style={[styles.card, { backgroundColor: themeColors.cardBackground }]}
      >
        <Card.Content>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {asset.name || asset.code || "Unnamed Asset"}
          </Text>
          <Divider
            style={[styles.divider, { backgroundColor: themeColors.divider }]}
          />

          {[
            { label: "Department", value: asset.department },
            { label: "Code", value: asset.code },
            { label: "Description", value: asset.description },
            { label: "Quantity", value: asset.qty },
            {
              label: "Unit Cost",
              value: asset.unit_cost ? `$${asset.unit_cost}` : undefined,
            },
            { label: "Location", value: asset.physical_location },
            { label: "Condition", value: asset.condition },
            { label: "Needs Repair", value: asset.need_repair ? "Yes" : "No" },
            { label: "Funding Source", value: asset.funding_source },
          ].map(
            (item, idx) =>
              item.value !== undefined && (
                <View key={idx} style={styles.detailRow}>
                  <Text style={[styles.label, { color: themeColors.subtitle }]}>
                    {item.label}:
                  </Text>
                  <Text style={[styles.value, { color: themeColors.text }]}>
                    {item.value}
                  </Text>
                </View>
              )
          )}

          {/* Depreciation Section */}
          <View style={{ marginTop: 16 }}>
            <Text
              style={[
                styles.label,
                { color: themeColors.subtitle, marginBottom: 6 },
              ]}
            >
              Depreciation: {depreciationValue}%
            </Text>
            <View style={styles.depreciationBarBackground}>
              <Animated.View
                style={[
                  styles.depreciationBarFill,
                  {
                    width: fillAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: getDepreciationColor(),
                  },
                ]}
              />
            </View>
            <Text style={[styles.subtitle, { marginTop: 6 }]}>
              Purchase Date:{" "}
              {asset.purchase_date
                ? new Date(asset.purchase_date).toDateString()
                : "-"}
            </Text>
            <Text style={[styles.subtitle]}>
              Time Remaining: {getRemainingTime()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
  },
  topImage: {
    width: width - 32,
    height: 220,
    borderRadius: 16,
    marginRight: 8,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "right",
  },
  depreciationBarBackground: {
    height: 20,
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#ccc",
    overflow: "hidden",
  },
  depreciationBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
});
