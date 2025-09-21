import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Surface,
  ProgressBar,
  Menu,
  Divider,
  RadioButton,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../services/supabaseClient";
import uuid from "react-native-uuid";

const { width } = Dimensions.get("window");

export default function AssetFormScreen() {
  const isDark = useColorScheme() === "dark";

  const [department, setDepartment] = useState("");
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [staffName, setStaffName] = useState("");
  const [code, setCode] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [fundingSource, setFundingSource] = useState("Gov. Lib");
  const [fundingMenuVisible, setFundingMenuVisible] = useState(false);
  const [physicalLocation, setPhysicalLocation] = useState("");
  const [depreciation, setDepreciation] = useState(0);
  const [condition, setCondition] = useState("Functional");
  const [needRepair, setNeedRepair] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const themeColors = {
    background: isDark ? "#121212" : "#f2f2f2",
    cardBackground: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#222",
    subtitle: isDark ? "#aaa" : "#555",
    accent: isDark ? "#bb86fc" : "#6200ee",
    inputBackground: isDark ? "#2a2a2a" : "#fff",
    progressGreen: "#4CAF50",
    progressOrange: "#FFA500",
    progressRed: "#F44336",
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase
        .from("assets")
        .select("department")
        .neq("department", null);
      if (data) {
        const uniqueDepartments = Array.from(
          new Set(data.map((item: any) => item.department))
        );
        setAllDepartments(uniqueDepartments);
      }
    };
    fetchDepartments();
  }, []);

  const filteredDepartments = allDepartments.filter(
    (d) =>
      d.toLowerCase().includes(department.toLowerCase()) &&
      department.length > 0
  );

  useEffect(() => {
    if (!purchaseDate) return;
    const now = new Date();
    const diffYears =
      (now.getTime() - purchaseDate.getTime()) / 1000 / 60 / 60 / 24 / 365;
    setDepreciation(Math.min(Math.round((diffYears / 3) * 100), 100));
  }, [purchaseDate]);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted)
      return Alert.alert("Permission denied", "Camera access is required.");

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    const fileName = `${uuid.v4()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("asset-images")
      .upload(fileName, buffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("asset-images")
      .getPublicUrl(fileName);

    if (!data?.publicUrl) throw new Error("Failed to get public URL");
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (
      !department ||
      !staffName ||
      !code ||
      !purchaseDate ||
      !qty ||
      !unitCost
    )
      return Alert.alert(
        "Validation Error",
        "Please fill all required fields."
      );

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const uploadedUrls: string[] = [];
      for (const uri of images) {
        const url = await uploadImage(uri);
        uploadedUrls.push(url);
      }

      const { error } = await supabase.from("assets").insert([
        {
          department: department.trim(),
          staff_name: staffName.trim(),
          code: code.trim(),
          purchase_date: purchaseDate.toISOString().split("T")[0],
          description,
          qty: parseInt(qty),
          unit_cost: parseFloat(unitCost),
          supplier_name: supplierName,
          funding_source: fundingSource,
          physical_location: physicalLocation,
          depreciation,
          condition,
          need_repair: needRepair,
          image_urls: uploadedUrls,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Asset recorded successfully!");
      resetForm();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDepartment("");
    setStaffName("");
    setCode("");
    setPurchaseDate(null);
    setDescription("");
    setQty("");
    setUnitCost("");
    setSupplierName("");
    setPhysicalLocation("");
    setDepreciation(0);
    setCondition("Functional");
    setNeedRepair(false);
    setImages([]);
    setFundingSource("Gov. Lib");
  };

  const getDepreciationColor = () => {
    if (depreciation >= 80) return themeColors.progressRed;
    if (depreciation >= 40) return themeColors.progressOrange;
    return themeColors.progressGreen;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: themeColors.background },
        ]}
      >
        <Surface
          style={[styles.card, { backgroundColor: themeColors.cardBackground }]}
        >
          <Text style={[styles.title, { color: themeColors.text }]}>
            Record New Asset
          </Text>

          {/* Department */}
          <TextInput
            label="Department *"
            value={department}
            onChangeText={setDepartment}
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />
          {filteredDepartments.length > 0 && (
            <View
              style={{
                backgroundColor: themeColors.cardBackground,
                borderRadius: 8,
                marginBottom: 16,
                elevation: 2,
              }}
            >
              {filteredDepartments.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDepartment(d)}
                  style={{ padding: 8 }}
                >
                  <Text style={{ color: themeColors.text }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            label="Staff Name *"
            value={staffName}
            onChangeText={setStaffName}
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />
          <TextInput
            label="Asset Code *"
            value={code}
            onChangeText={setCode}
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />

          {/* Funding Source Dropdown */}
          <Menu
            visible={fundingMenuVisible}
            onDismiss={() => setFundingMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFundingMenuVisible(true)}
                style={styles.input}
              >
                Funding Source: {fundingSource}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setFundingSource("Gov. Lib");
                setFundingMenuVisible(false);
              }}
              title="Gov. Lib"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setFundingSource("Donated");
                setFundingMenuVisible(false);
              }}
              title="Donated"
            />
          </Menu>

          {/* Purchase Date */}
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            {purchaseDate
              ? purchaseDate.toDateString()
              : "Select Purchase Date *"}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={purchaseDate || new Date()}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(e, d) => {
                setShowDatePicker(false);
                if (d) setPurchaseDate(d);
              }}
            />
          )}

          {/* Other Inputs */}
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />
          <TextInput
            label="Quantity *"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />
          <TextInput
            label="Unit Cost *"
            value={unitCost}
            onChangeText={setUnitCost}
            keyboardType="numeric"
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />
          <TextInput
            label="Supplier Name"
            value={supplierName}
            onChangeText={setSupplierName}
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />
          <TextInput
            label="Physical Location"
            value={physicalLocation}
            onChangeText={setPhysicalLocation}
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBackground },
            ]}
            mode="outlined"
          />

          {/* Depreciation */}
          <View style={{ marginVertical: 16 }}>
            <Text style={{ color: themeColors.subtitle, marginBottom: 4 }}>
              Depreciation: {depreciation}%
            </Text>
            <ProgressBar
              progress={depreciation / 100}
              color={getDepreciationColor()}
              style={{ height: 10, borderRadius: 5 }}
            />
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: themeColors.subtitle }]}
            >
              Condition
            </Text>
            <RadioButton.Group onValueChange={setCondition} value={condition}>
              <View style={styles.radioRow}>
                <RadioButton value="Functional" />
                <Text style={styles.radioLabel}>Functional</Text>
                <RadioButton value="Damaged" />
                <Text style={styles.radioLabel}>Damaged</Text>
              </View>
            </RadioButton.Group>
          </View>

          {/* Need Repair */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: themeColors.subtitle }]}
            >
              Need Repair?
            </Text>
            <RadioButton.Group
              onValueChange={(val) => setNeedRepair(val === "true")}
              value={needRepair ? "true" : "false"}
            >
              <View style={styles.radioRow}>
                <RadioButton value="true" />
                <Text style={styles.radioLabel}>Yes</Text>
                <RadioButton value="false" />
                <Text style={styles.radioLabel}>No</Text>
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
              {images.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.image} />
              ))}
            </ScrollView>
          </View>

          {/* Submit */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          >
            Save Asset
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 20, marginTop: 16, elevation: 6 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: { marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionLabel: { fontWeight: "600", marginBottom: 8 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  radioLabel: { marginRight: 16 },
  imagesContainer: { marginBottom: 24 },
  addPhotoButton: { borderRadius: 10 },
  image: { width: 90, height: 90, borderRadius: 14, marginRight: 10 },
  submitButton: { borderRadius: 14, paddingVertical: 10 },
});
