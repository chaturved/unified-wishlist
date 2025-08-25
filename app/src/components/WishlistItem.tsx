import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { timeAgo } from "../utils/timeAgo";
import { WishlistItem } from "../types/WishlistItem";

interface Props {
  item: WishlistItem;
  showLink?: boolean;
  onDeleted?: () => void;
  showDelete?: boolean;
}

export default function WishlistItemCard({
  item,
  showLink = true,
  onDeleted,
  showDelete = true,
}: Props) {
  const handleDelete = async () => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this from your wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: onDeleted,
        },
      ]
    );
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.thumb}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbImage} />
        ) : (
          <Feather name="image" size={20} color="#9ca3af" />
        )}
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.itemMeta}>
          <Text style={styles.price}>
            {item.currency ? `${item.currency} ${item.price}` : item.price}
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.source}>{item.source}</Text>
        </View>

        {item.createdAt ? (
          <Text style={styles.timestamp}>{timeAgo(item.createdAt)}</Text>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        {/* Open Link */}
        {showLink ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(item.url)}
            accessibilityLabel={`Open link for ${item.title}`}
          >
            <Feather name="external-link" size={18} color="#2563eb" />
          </TouchableOpacity>
        ) : null}

        {/* Delete */}
        {showDelete ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDelete}
            accessibilityLabel={`Delete ${item.title} from wishlist`}
          >
            <Feather name="trash-2" size={18} color="#dc2626" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%", resizeMode: "cover" },
  itemContent: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 16, fontWeight: "500", color: "#000" },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 2,
  },
  price: { fontSize: 14, fontWeight: "600", color: "#2563eb" },
  dot: { fontSize: 14, color: "#d1d5db" },
  source: { fontSize: 14, color: "#4b5563" },
  timestamp: { fontSize: 12, color: "#6b7280" },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
});
