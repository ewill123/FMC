import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  useColorScheme,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../services/supabaseClient";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  const [agentName, setAgentName] = useState("Field Agent");
  const [officesCount, setOfficesCount] = useState<number | null>(null);
  const [assetsCount, setAssetsCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const fetchAgentData = async () => {
    setRefreshing(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const agentId = userData?.user?.id;
      const agentEmail = userData?.user?.email || "Field Agent";
      setAgentName(agentEmail);

      if (!agentId) {
        setOfficesCount(0);
        setAssetsCount(0);
        setRefreshing(false);
        return;
      }

      const { data: officesData, error: officesError } = await supabase
        .from("offices")
        .select("*");
      if (officesError) throw officesError;
      setOfficesCount(officesData?.length || 0);

      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .eq("created_by", agentId);
      if (assetsError) throw assetsError;
      setAssetsCount(assetsData?.length || 0);
    } catch (error: any) {
      console.log("Fetch error:", error.message);
      setOfficesCount(0);
      setAssetsCount(0);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const loading = officesCount === null || assetsCount === null;

  const themeColors = {
    backgroundGradient: isDarkMode
      ? ["#1c1c1c", "#121212", "#000"]
      : ["#4c669f", "#3b5998", "#192f6a"],
    text: "#fff",
    cardBackground: isDarkMode ? "#1f1f1f" : "#fff",
    cardText: isDarkMode ? "#fff" : "#333",
    avatarBackground: "#3b5998",
    statsNumber: isDarkMode ? "#90caf9" : "#3b5998",
    statsLabel: isDarkMode ? "#ccc" : "#555",
    logoutButton: "#e74c3c",
  };

  return (
    <LinearGradient
      colors={themeColors.backgroundGradient as [string, string, string]}
      style={styles.gradient}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "light-content"} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAgentData} />
        }
      >
        <Text style={[styles.title, { color: themeColors.text }]}>
          Welcome, {agentName}
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card
            style={[
              styles.statsCard,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Card.Content style={styles.statsContent}>
              {loading ? (
                <ActivityIndicator animating color={themeColors.statsNumber} />
              ) : (
                <>
                  <Text
                    style={[
                      styles.statsNumber,
                      { color: themeColors.statsNumber },
                    ]}
                  >
                    {officesCount}
                  </Text>
                  <Text
                    style={[
                      styles.statsLabel,
                      { color: themeColors.statsLabel },
                    ]}
                  >
                    Total Offices
                  </Text>
                </>
              )}
            </Card.Content>
          </Card>

          <Card
            style={[
              styles.statsCard,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Card.Content style={styles.statsContent}>
              {loading ? (
                <ActivityIndicator animating color={themeColors.statsNumber} />
              ) : (
                <>
                  <Text
                    style={[
                      styles.statsNumber,
                      { color: themeColors.statsNumber },
                    ]}
                  >
                    {assetsCount}
                  </Text>
                  <Text
                    style={[
                      styles.statsLabel,
                      { color: themeColors.statsLabel },
                    ]}
                  >
                    Assets Recorded
                  </Text>
                </>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        {[
          {
            text: "View Offices",
            icon: "office-building",
            action: () => navigation.navigate("OfficeList"),
          },
          {
            text: "Record New Asset",
            icon: "plus-box-outline",
            action: () => navigation.navigate("AssetForm", { office_id: "" }),
          },
          {
            text: "Submit/View Reports",
            icon: "file-document-outline",
            action: () => console.log("Reports pressed"),
          },
          {
            text: "Notifications & Alerts",
            icon: "bell-outline",
            action: () => console.log("Notifications pressed"),
          },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} onPress={item.action}>
            <Card
              style={[
                styles.card,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              <Card.Content style={styles.cardContent}>
                <Avatar.Icon
                  size={40}
                  icon={item.icon as any}
                  style={[
                    styles.avatar,
                    { backgroundColor: themeColors.avatarBackground },
                  ]}
                />
                <Text
                  style={[styles.cardText, { color: themeColors.cardText }]}
                >
                  {item.text}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}

        <Button
          mode="contained"
          style={[
            styles.logoutButton,
            { backgroundColor: themeColors.logoutButton },
          ]}
          onPress={async () => {
            await supabase.auth.signOut();
            navigation.replace("Login");
          }}
        >
          Logout
        </Button>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, padding: 16, justifyContent: "flex-start" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },

  // Stats Section
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    elevation: 6,
    alignItems: "center",
    paddingVertical: 16,
  },
  statsContent: { alignItems: "center" },
  statsNumber: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  statsLabel: { fontSize: 14, textAlign: "center" },

  // Quick Action Cards
  card: { marginBottom: 16, borderRadius: 20, elevation: 6 },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  avatar: { marginRight: 16 },
  cardText: { fontSize: 18, fontWeight: "500" },

  // Logout button
  logoutButton: { marginTop: 16, borderRadius: 10, paddingVertical: 6 },
});
