import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Modal,
} from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../services/supabaseClient";
import LottieView from "lottie-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;
const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen({ navigation }: Props) {
  const [agentName, setAgentName] = useState("Field Agent");
  const [assetsCount, setAssetsCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);

  const lottieRef = useRef<LottieView>(null);
  const isDarkMode = useColorScheme() === "dark";

  const themeColors = {
    gradient: isDarkMode ? ["#121212", "#1c1c1c"] : ["#4c669f", "#3b5998"],
    text: isDarkMode ? "#fff" : "#1a1a1a",
    cardBackground: isDarkMode ? "#1f1f1f" : "#fff",
    statsNumber: isDarkMode ? "#90caf9" : "#3b5998",
    statsLabel: isDarkMode ? "#ccc" : "#555",
    cubeBackground: isDarkMode ? "#2c2c2c" : "#f5f5f5",
    cubeIcon: isDarkMode ? "#90caf9" : "#3b5998",
    cubeLabel: isDarkMode ? "#90caf9" : "#3b5998",
    logoutButton: "#e74c3c",
    footerText: "#888",
  };

  const fetchAssetsCount = async () => {
    setRefreshing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      setAgentName(userData?.user?.email || "Field Agent");

      const { data: assets, error } = await supabase.from("assets").select("*");
      if (error) throw error;
      setAssetsCount(assets?.length || 0);
    } catch (err: any) {
      console.log("Dashboard fetch error:", err.message);
      setAssetsCount(0);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssetsCount();
    const interval = setInterval(fetchAssetsCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const loading = assetsCount === null;

  const cubeButtons = [
    {
      label: "Record Asset",
      icon: "plus-box",
      action: () => navigation.navigate("AssetForm", { office_id: "" }),
    },
    {
      label: "View Assets",
      icon: "cube-outline",
      action: () => navigation.navigate("AssetsList"),
    },
  ];

  const handleLogout = async () => {
    setShowLogoutLoader(true);
    try {
      await supabase.auth.signOut();

      // Play Lottie animation then navigate
      lottieRef.current?.play();
      setTimeout(() => {
        setShowLogoutLoader(false);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }, 2000); // adjust duration based on your Lottie file
    } catch (err: any) {
      setShowLogoutLoader(false);
      Alert.alert("Logout Error", err.message);
    }
  };

  return (
    <LinearGradient
      colors={themeColors.gradient as [string, string]}
      style={styles.gradient}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAssetsCount}
          />
        }
      >
        {/* NEC Logo */}
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Greeting */}
        <Text style={[styles.greeting, { color: themeColors.text }]}>
          Welcome, {agentName.split("@")[0]}
        </Text>
        <Text style={[styles.emailText, { color: themeColors.text }]}>
          {agentName}
        </Text>

        {/* Total Assets Card */}
        <Card
          style={[
            styles.assetsCard,
            { backgroundColor: themeColors.cardBackground },
          ]}
          elevation={5}
        >
          <Card.Content style={styles.assetsContent}>
            {loading ? (
              <ActivityIndicator
                animating
                color={themeColors.statsNumber}
                size={60}
              />
            ) : (
              <>
                <Text
                  style={[
                    styles.assetsNumber,
                    { color: themeColors.statsNumber },
                  ]}
                >
                  {assetsCount}
                </Text>
                <Text
                  style={[
                    styles.assetsLabel,
                    { color: themeColors.statsLabel },
                  ]}
                >
                  Total Assets
                </Text>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Cube Buttons */}
        <View style={styles.cubeContainer}>
          {cubeButtons.map((cube, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={cube.action}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.cube,
                  {
                    backgroundColor: themeColors.cubeBackground,
                    width: (screenWidth - 64) / 2,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={cube.icon as any}
                  size={50}
                  color={themeColors.cubeIcon}
                />
                <Text
                  style={[styles.cubeLabel, { color: themeColors.cubeLabel }]}
                >
                  {cube.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout - full card touchable */}
        <TouchableOpacity activeOpacity={0.8} onPress={handleLogout}>
          <Card
            style={[
              styles.logoutCard,
              { backgroundColor: themeColors.logoutButton },
            ]}
            elevation={5}
          >
            <Card.Content>
              <Text style={styles.logoutText}>Logout</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={[styles.footer, { color: themeColors.footerText }]}>
          Created by Emmanuel Cheeseman | FMC Department | NEC
        </Text>
      </ScrollView>

      {/* Logout Lottie Animation */}
      <Modal visible={showLogoutLoader} transparent animationType="fade">
        <View style={styles.loaderContainer}>
          <LottieView
            ref={lottieRef}
            source={require("../Loading.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: "flex-start" },
  logo: { width: 120, height: 60, alignSelf: "center", marginVertical: 12 },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  emailText: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 24,
    textAlign: "center",
  },
  assetsCard: {
    borderRadius: 18,
    paddingVertical: 36,
    marginBottom: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  assetsContent: { alignItems: "center" },
  assetsNumber: { fontSize: 60, fontWeight: "800" },
  assetsLabel: { fontSize: 22, marginTop: 10 },
  cubeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  cube: {
    height: 160,
    borderRadius: 18,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  cubeLabel: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  logoutCard: {
    borderRadius: 18,
    marginTop: 36,
    paddingVertical: 18,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: { width: 200, height: 200 },
});
