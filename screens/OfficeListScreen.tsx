import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { Text, Card, ActivityIndicator, Snackbar } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { supabase } from "../services/supabaseClient";

type Props = NativeStackScreenProps<RootStackParamList, "OfficeList">;

export default function OfficeListScreen({ navigation }: Props) {
  const [offices, setOffices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Fetch all offices
  const fetchOffices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("offices").select("*");
      if (error) throw error;
      setOffices(data || []);
    } catch (error: any) {
      console.error("Error fetching offices:", error.message);
      setErrorMsg("Failed to load offices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffices();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      onPress={() => {
        if (!item.id) {
          setErrorMsg("Invalid office ID. Cannot navigate.");
          return;
        }
        navigation.navigate("AssetForm", { office_id: item.id });
      }}
    >
      <Card
        style={[styles.card, { backgroundColor: isDark ? "#1c1c1c" : "#fff" }]}
      >
        <Card.Content>
          <Text style={[styles.cardText, { color: isDark ? "#fff" : "#333" }]}>
            {item.name}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f2f2f7" },
      ]}
    >
      <FlatList
        data={offices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={offices.length === 0 && styles.center}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: isDark ? "#fff" : "#333",
            }}
          >
            No offices found.
          </Text>
        }
      />

      {/* Error Snackbar */}
      <Snackbar
        visible={!!errorMsg}
        onDismiss={() => setErrorMsg(null)}
        duration={3000}
        style={{ backgroundColor: "#B00020" }}
      >
        {errorMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { justifyContent: "center", alignItems: "center" },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
    paddingVertical: 12,
  },
  cardText: { fontSize: 18, fontWeight: "500" },
});
