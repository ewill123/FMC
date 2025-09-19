import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { supabase } from "../services/supabaseClient";

type Props = NativeStackScreenProps<RootStackParamList, "ReportDetail">;

export default function ReportDetailScreen({ route, navigation }: Props) {
  const { report_id } = route.params ?? {};
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const themeColors = {
    background: isDarkMode ? "#121212" : "#f4f4f4",
    cardBackground: isDarkMode ? "#1f1f1f" : "#fff",
    text: isDarkMode ? "#fff" : "#333",
    label: isDarkMode ? "#ccc" : "#555",
    button: "#3b5998",
  };

  const fetchReport = async () => {
    if (!report_id) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", report_id)
        .single();
      if (error) throw error;
      setReport(data);
    } catch (err: any) {
      console.log("Fetch report error:", err.message);
      setReport(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: themeColors.background }]}
      >
        <ActivityIndicator animating size="large" color={themeColors.button} />
      </View>
    );
  }

  if (!report) {
    return (
      <View
        style={[styles.center, { backgroundColor: themeColors.background }]}
      >
        <Text style={{ color: themeColors.text }}>Report not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchReport} />
      }
    >
      <Text style={[styles.title, { color: themeColors.text }]}>
        Report Details
      </Text>

      <Card
        style={[styles.card, { backgroundColor: themeColors.cardBackground }]}
      >
        <Card.Content>
          <Text style={[styles.label, { color: themeColors.label }]}>
            Report ID:
          </Text>
          <Text style={[styles.value, { color: themeColors.text }]}>
            {report.id}
          </Text>

          <Text style={[styles.label, { color: themeColors.label }]}>
            Submitted By:
          </Text>
          <Text style={[styles.value, { color: themeColors.text }]}>
            {report.submitted_by || "Unknown"}
          </Text>

          <Text style={[styles.label, { color: themeColors.label }]}>
            Office:
          </Text>
          <Text style={[styles.value, { color: themeColors.text }]}>
            {report.office_name || "N/A"}
          </Text>

          <Text style={[styles.label, { color: themeColors.label }]}>
            Description:
          </Text>
          <Text style={[styles.value, { color: themeColors.text }]}>
            {report.description || "No description provided."}
          </Text>

          <Text style={[styles.label, { color: themeColors.label }]}>
            Status:
          </Text>
          <Text style={[styles.value, { color: themeColors.text }]}>
            {report.status || "Pending"}
          </Text>

          <Text style={[styles.label, { color: themeColors.label }]}>
            Created At:
          </Text>
          <Text style={[styles.value, { color: themeColors.text }]}>
            {new Date(report.created_at).toLocaleString()}
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <Button
        mode="contained"
        style={[styles.button, { backgroundColor: themeColors.button }]}
        onPress={() => console.log("Mark as Resolved")}
      >
        Mark as Resolved
      </Button>
      <Button
        mode="outlined"
        style={styles.button}
        onPress={() => console.log("Share Report")}
      >
        Share Report
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 16,
    elevation: 4,
  },
  label: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  value: { fontSize: 16, marginBottom: 4 },
  button: { marginVertical: 8, borderRadius: 10, paddingVertical: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
