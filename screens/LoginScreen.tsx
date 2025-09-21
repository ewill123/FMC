import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  useTheme,
} from "react-native-paper";
import { supabase } from "../services/supabaseClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
const screenHeight = Dimensions.get("window").height;

export default function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const lottieRef = useRef<LottieView>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Validation Error", "Email and password are required");
    }

    setLoading(true);
    setShowLoader(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Wait until Lottie finishes before navigating
      lottieRef.current?.play();
      setTimeout(() => {
        setShowLoader(false);
        navigation.replace("Dashboard");
      }, 2000); // adjust based on animation duration
    } catch (err: any) {
      setShowLoader(false);
      Alert.alert("Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const emailError = email && !/^\S+@\S+\.\S+$/.test(email);

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>FMC Asset Management</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
              error={!!emailError}
              activeOutlineColor={theme.colors.primary}
            />
            {emailError && (
              <HelperText type="error" visible={true}>
                Enter a valid email address
              </HelperText>
            )}

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" />}
              activeOutlineColor={theme.colors.primary}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
              contentStyle={{ paddingVertical: 10 }}
              uppercase={false}
            >
              Login
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Lottie Modal */}
      <Modal visible={showLoader} transparent animationType="fade">
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
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    alignItems: "center",
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#f7f7f7",
    width: "100%",
    borderRadius: 12,
  },
  button: {
    borderRadius: 16,
    marginTop: 12,
    width: "100%",
    backgroundColor: "#6200ee",
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: { width: 200, height: 200 },
});
