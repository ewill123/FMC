import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  TextInput as RNTextInput,
  RefreshControl,
} from "react-native";
import { Text, ActivityIndicator, Chip, IconButton } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getAssets, Asset } from "../services/assetService";

// Relative time
const timeAgo = (dateStr?: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Exact formatted time
const formatExactTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

// Group assets by department
const groupAssetsByDepartment = (assets: Asset[]) => {
  const grouped: Record<string, Asset[]> = {};
  assets.forEach((asset) => {
    const dept = asset.department || "Unknown Department";
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(asset);
  });
  return grouped;
};

type Props = NativeStackScreenProps<RootStackParamList, "AssetsList">;

export default function AssetsListScreen({ navigation }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const isDarkMode = useColorScheme() === "dark";

  const themeColors = {
    background: isDarkMode ? "#121212" : "#f5f5f5",
    cardBackground: isDarkMode ? "#1e1e1e" : "#fff",
    text: isDarkMode ? "#fff" : "#222",
    subtitle: isDarkMode ? "#aaa" : "#555",
    title: isDarkMode ? "#fff" : "#111",
    accent: isDarkMode ? "#bb86fc" : "#6200ee",
    badgeBackground: isDarkMode ? "#333" : "#eee",
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Accurate search
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        (a.name?.toLowerCase().includes(q) ?? false) ||
        (a.code?.toLowerCase().includes(q) ?? false) ||
        (a.department?.toLowerCase().includes(q) ?? false)
    );
  }, [assets, searchQuery]);

  const groupedAssets = useMemo(
    () => groupAssetsByDepartment(filteredAssets),
    [filteredAssets]
  );

  const renderAssetItem = ({ item }: { item: Asset }) => {
    const imageUrl =
      item.image_urls && item.image_urls.length > 0
        ? item.image_urls[0]
        : "https://via.placeholder.com/100x100?text=No+Image";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AssetDetail", { asset: item })}
      >
        <View
          style={[
            styles.assetCard,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.assetInfo}>
            <Text
              style={[styles.title, { color: themeColors.text }]}
              numberOfLines={2}
            >
              {item.name || item.code || "Unnamed Asset"}
            </Text>
            {item.purchase_date && (
              <Text style={[styles.time, { color: themeColors.accent }]}>
                {timeAgo(item.purchase_date)} (
                {formatExactTime(item.purchase_date)})
              </Text>
            )}
            <View style={{ flexDirection: "row", marginTop: 4, gap: 6 }}>
              <Chip
                mode="outlined"
                style={{ backgroundColor: themeColors.badgeBackground }}
              >
                Qty: {item.qty ?? 0}
              </Chip>
              {item.condition && (
                <Chip
                  mode="outlined"
                  style={{ backgroundColor: themeColors.badgeBackground }}
                >
                  {item.condition}
                </Chip>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading)
    return (
      <View
        style={[styles.center, { backgroundColor: themeColors.background }]}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );

  // Show folders if no department selected
  if (!selectedDept) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <View style={styles.headerContainer}>
          <Text style={[styles.pageTitle, { color: themeColors.title }]}>
            Departments
          </Text>
          <RNTextInput
            placeholder="Search by department..."
            placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.searchBar,
              {
                backgroundColor: themeColors.cardBackground,
                color: themeColors.text,
              },
            ]}
          />
        </View>

        <FlatList
          key="folders" // fix numColumns error
          data={Object.keys(groupedAssets)}
          keyExtractor={(dept) => dept}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 32,
            paddingTop: 12,
          }}
          renderItem={({ item: dept }) => (
            <TouchableOpacity
              style={styles.folderContainer}
              onPress={() => setSelectedDept(dept)}
            >
              <IconButton
                icon="folder"
                size={120}
                iconColor={themeColors.accent}
              />
              <Text style={[styles.folderLabel, { color: themeColors.text }]}>
                {dept}
              </Text>
              <Text style={{ color: themeColors.subtitle, fontSize: 12 }}>
                {groupedAssets[dept].length} assets
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Show assets inside selected department
  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={32}
          mode="contained"
          onPress={() => setSelectedDept(null)}
          style={{ margin: 0 }}
          iconColor={themeColors.accent}
        />
        <Text style={[styles.pageTitle, { color: themeColors.title }]}>
          {selectedDept}
        </Text>
      </View>

      <FlatList
        key="assets" // fix numColumns error
        data={groupedAssets[selectedDept]}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={renderAssetItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAssets();
            }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  pageTitle: { fontSize: 28, fontWeight: "700", marginLeft: 4 },
  searchBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    fontSize: 16,
    flex: 1,
  },
  folderContainer: {
    flex: 1,
    alignItems: "center",
    margin: 24,
    justifyContent: "center",
  },
  folderLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  assetCard: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    padding: 12,
  },
  image: { width: 100, height: 100, borderRadius: 12, marginRight: 12 },
  assetInfo: { flex: 1, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 2 },
  time: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
