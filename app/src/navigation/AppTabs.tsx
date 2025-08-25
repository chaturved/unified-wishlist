import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WishlistScreen from "../screens/WishlistScreen";
import Feather from "react-native-vector-icons/Feather";
import PreviewScreen from "../screens/PreviewScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="heart" size={20} color={color} />
          ),
          tabBarAccessibilityLabel: "Wishlist tab, view your saved items",
        }}
      />
      <Tab.Screen
        name="Add"
        component={PreviewScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="plus-circle" size={20} color={color} />
          ),
          tabBarAccessibilityLabel: "Add tab, add a new wishlist item",
        }}
      />
    </Tab.Navigator>
  );
}
