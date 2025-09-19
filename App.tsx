import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import { LogBox } from "react-native";

// Ignore unnecessary warnings for MVP
LogBox.ignoreLogs(["Setting a timer"]);

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
