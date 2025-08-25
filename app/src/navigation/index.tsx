import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./AppTabs";

// Deep linking configuration
const linking = {
  prefixes: ["centscape://"],
  config: {
    screens: {
      HomeTabs: {
        path: "",
        screens: {
          Wishlist: { path: "wishlist" },
          Add: { path: "add" },
        },
      },
    },
  },
};

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="HomeTabs">
        <Stack.Screen
          name="HomeTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
