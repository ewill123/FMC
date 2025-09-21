import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AssetFormScreen from "../screens/AssetFormScreen";
import AssetsListScreen from "../screens/AssetsListScreen";
import AssetDetailScreen from "../screens/AssetDetailScreen";

// Define the stack params
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  OfficeList: undefined;
  AssetForm: { office_id: string };
  AssetsList: undefined;
  AssetDetail: { asset: any }; // replace `any` with proper Asset type if you have it
  ReportsList: undefined;
  ReportDetail: { report_id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {/* Authentication */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Main Dashboard */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />

      {/* Assets */}
      <Stack.Screen name="AssetForm" component={AssetFormScreen} />
      <Stack.Screen name="AssetsList" component={AssetsListScreen} />
      <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />

      {/* Reports */}
    </Stack.Navigator>
  );
}
