/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { getWishlist, clearWishlist, removeItemFromWishlist } from "../storage";
import WishlistItemCard from "../components/WishlistItem";
import { WishlistItem } from "../types/WishlistItem";

export default function WishlistScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWishlist = async () => {
    setLoading(true);
    setError(false);
    try {
      const items = await getWishlist();
      setWishlist(items);
    } catch (err) {
      console.error("Error loading wishlist", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await loadWishlist();
    });
    return unsubscribe;
  }, [navigation]);

  const handleClearWishlist = () => {
    Alert.alert(
      "Clear Wishlist",
      "Are you sure you want to remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearWishlist();
            await loadWishlist();
          },
        },
      ]
    );
  };

  const onRemoveWishlistItem = async (item: WishlistItem) => {
    await removeItemFromWishlist(item.normalizedUrl);
    await loadWishlist();
  };

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <WishlistItemCard
      item={item}
      onDeleted={() => onRemoveWishlistItem(item)}
    />
  );

  const renderSkeleton = () => {
    return (
      <View style={styles.itemCard}>
        <View style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: 16,
              backgroundColor: "#e5e7eb",
              marginBottom: 6,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              height: 14,
              backgroundColor: "#e5e7eb",
              width: "50%",
              borderRadius: 4,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Feather name="heart" size={20} color="#2563eb" />
          </View>
          <Text style={styles.title}>Wishlist</Text>
        </View>

        {/* Clear Wishlist button */}
        {wishlist.length > 0 && !loading && !error && (
          <TouchableOpacity
            onPress={handleClearWishlist}
            accessibilityLabel="Clear all items from wishlist"
          >
            <Feather name="trash-2" size={20} color="#dc2626" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              {renderSkeleton()}
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={{ color: "#dc2626", marginBottom: 12 }}>
            Failed to load wishlist.
          </Text>
          {/* Retry on error */}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadWishlist}
            accessibilityLabel="Retry loading wishlist"
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : wishlist.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 40, color: "#6b7280" }}>
          No items in wishlist
        </Text>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.normalizedUrl}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingBottom: insets.bottom + 100,
          }}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom }]}
        onPress={() => navigation.navigate("Add")}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.fabText}>Add Item</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: { fontSize: 24, fontWeight: "600", color: "#000" },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    marginRight: 12,
  },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
