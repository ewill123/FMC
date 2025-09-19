import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AssetFormScreen from "../screens/AssetFormScreen";
import OfficeListScreen from "../screens/OfficeListScreen";
import ReportDetailScreen from "../screens/ReportDetailScreen";

// Define the stack params
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  OfficeList: undefined;
  AssetForm: { office_id: string }; // mandatory
  ReportDetail: { report_id: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Hide headers globally
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="OfficeList" component={OfficeListScreen} />
      <Stack.Screen name="AssetForm" component={AssetFormScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}
