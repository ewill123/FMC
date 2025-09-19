import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  useColorScheme,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  RadioButton,
  Text,
  Menu,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabaseClient";

type Props = NativeStackScreenProps<RootStackParamList, "AssetForm">;

export default function AssetFormScreen({ route, navigation }: Props) {
  const { office_id } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [condition, setCondition] = useState("Good");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>(
    []
  );
  const [assignedStaff, setAssignedStaff] = useState<string | undefined>(
    undefined
  );
  const [menuVisible, setMenuVisible] = useState(false);

  // Fetch staff for the office
  useEffect(() => {
    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("id, name")
        .eq("office_id", office_id);

      if (error) console.log("Error fetching staff:", error.message);
      else setStaffList(data || []);
    };
    fetchStaff();
  }, [office_id]);

  // Pick image from camera
  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission denied",
        "Camera access is required to take photos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) setImages([...images, result.assets[0].uri]);
  };

  // Submit asset form
  const handleSubmit = async () => {
    if (!assetName || !assetType || !purchaseYear) {
      return Alert.alert(
        "Validation Error",
        "Please fill in all required fields"
      );
    }

    setLoading(true);
    try {
      // Get current user UUID
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const agentId = userData?.user?.id;
      if (!agentId) throw new Error("Unable to identify current user.");

      // Insert asset using UUIDs
      const { error } = await supabase.from("assets").insert([
        {
          office_id,
          staff_id: assignedStaff || null,
          name: assetName,
          type: assetType,
          condition,
          serial_number: serialNumber,
          purchase_year: purchaseYear,
          notes,
          images,
          created_by: agentId, // <-- UUID instead of email
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Asset recorded successfully!");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? "#121212" : "#f2f2f2" },
        ]}
      >
        <Card
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
          ]}
        >
          <Card.Content>
            <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>
              Record New Asset
            </Text>

            <TextInput
              label="Asset Name *"
              value={assetName}
              onChangeText={setAssetName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Asset Type / Category *"
              value={assetType}
              onChangeText={setAssetType}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Serial / ID Number"
              value={serialNumber}
              onChangeText={setSerialNumber}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Year of Purchase *"
              value={purchaseYear}
              onChangeText={setPurchaseYear}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Staff Assignment */}
            {staffList.length > 0 && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={{ marginBottom: 16 }}
                  >
                    {assignedStaff
                      ? staffList.find((s) => s.id === assignedStaff)?.name
                      : "Assign to Staff (optional)"}
                  </Button>
                }
              >
                {staffList.map((staff) => (
                  <Menu.Item
                    key={staff.id}
                    onPress={() => {
                      setAssignedStaff(staff.id);
                      setMenuVisible(false);
                    }}
                    title={staff.name}
                  />
                ))}
              </Menu>
            )}

            <TextInput
              label="Additional Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              style={styles.input}
            />

            {/* Condition */}
            <View style={styles.conditionContainer}>
              <Text style={styles.sectionLabel}>Condition:</Text>
              <RadioButton.Group onValueChange={setCondition} value={condition}>
                <View style={styles.radioRow}>
                  <RadioButton value="Good" />
                  <Text style={styles.radioLabel}>Good</Text>
                  <RadioButton value="Needs Repair" />
                  <Text style={styles.radioLabel}>Needs Repair</Text>
                  <RadioButton value="Broken" />
                  <Text style={styles.radioLabel}>Broken</Text>
                </View>
              </RadioButton.Group>
            </View>

            {/* Images */}
            <View style={styles.imagesContainer}>
              <Button
                mode="outlined"
                icon="camera"
                onPress={pickImage}
                style={styles.addPhotoButton}
              >
                Add Photo
              </Button>
              <ScrollView horizontal style={{ marginTop: 8 }}>
                {images.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.image} />
                ))}
              </ScrollView>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            >
              Save Asset
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 16, elevation: 4 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: { marginBottom: 16 },
  conditionContainer: { marginBottom: 16 },
  sectionLabel: { marginBottom: 8, fontWeight: "600" },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  radioLabel: { marginRight: 16 },
  imagesContainer: { marginBottom: 24 },
  addPhotoButton: { borderRadius: 8 },
  image: { width: 80, height: 80, borderRadius: 12, marginRight: 8 },
  submitButton: { borderRadius: 12, paddingVertical: 8 },
});
