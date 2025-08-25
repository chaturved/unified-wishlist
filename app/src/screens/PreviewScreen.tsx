/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import {
  addItemToWishlist,
  getWishlist,
  normalizeUrl,
  removeItemFromWishlist,
} from "../storage";
import WishlistItemCard from "../components/WishlistItem";
import {
  isValidCurrency,
  isValidPrice,
  isValidURL,
  isValueNA,
} from "../utils/previewFormValidation";
import { PreviewData } from "../types/PreviewData";
import { WishlistItem } from "../types/WishlistItem";
import { PreviewRequest } from "../types/PreviewRequest";

export default function PreviewScreen({ route }: any) {
  const baseApiUrl: string = process.env.EXPO_PUBLIC_API_BASE_URL;
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<PreviewData>({
    title: "",
    sourceUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const [manualTitle, setManualTitle] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualCurrency, setManualCurrency] = useState("");
  const [manualSiteName, setManualSiteName] = useState("");

  useEffect(() => {
    if (route?.params?.url) {
      setUrl(route.params.url);
    }
  }, [route?.params?.url]);

  const fetchPreview = async () => {
    if (!url) {
      Alert.alert("Enter a URL first");
      return;
    }

    setLoading(true);
    try {
      const previewRequest: PreviewRequest = { url };
      const res = await fetch(`${baseApiUrl}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewRequest),
      });

      if (!res.ok) throw new Error("Failed to fetch preview");

      const data: PreviewData = await res.json();
      setPreview(data);

      setManualTitle(data.title || "");
      setManualImage(data.image || "");
      setManualPrice(data.price || "");
      setManualCurrency(data.currency || "");
      setManualSiteName(data.siteName || "");
    } catch (err: any) {
      Alert.alert(
        "Error fetching preview",
        err.message || "Something went wrong",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: fetchPreview },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async () => {
    try {
      const item: WishlistItem = {
        title: manualTitle,
        image: manualImage,
        price: manualPrice,
        currency: manualCurrency,
        source: manualSiteName,
        url: preview.sourceUrl || url,
        normalizedUrl: normalizeUrl(preview.sourceUrl || url),
        createdAt: new Date().toISOString(),
      };

      const wishlist = await getWishlist();
      const existing = wishlist.find(
        (i) => i.normalizedUrl === item.normalizedUrl
      );

      if (existing) {
        Alert.alert(
          "Item already exists",
          "This item is already in your wishlist. Do you want to update it?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Update",
              onPress: async () => {
                await removeItemFromWishlist(existing.normalizedUrl);
                await addItemToWishlist(item);
                Alert.alert("Updated", `"${item.title}" has been updated.`);
              },
            },
          ]
        );
        return;
      }

      await addItemToWishlist(item);
      Alert.alert("Saved", `"${item.title}" saved to wishlist.`);
    } catch (err) {
      console.error("Error saving item", err);
      Alert.alert("Error", "Could not save item to wishlist.");
    }
  };

  const renderSkeleton = () => (
    <View style={styles.previewCard}>
      <View
        style={[styles.previewImageWrapper, { backgroundColor: "#e5e7eb" }]}
      />
      <View style={styles.previewContent}>
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

  const disableSaveToWishlist = () => {
    const titleOk = !!manualTitle;
    const imageOk = manualImage === "" || isValidURL(manualImage);
    const sourceOk = !!manualSiteName;
    const priceOk = isValidPrice(manualPrice);
    const currencyOk = isValueNA(manualPrice)
      ? manualCurrency === ""
      : isValidCurrency(manualCurrency);
    return !(titleOk && imageOk && sourceOk && priceOk && currencyOk);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Feather name="plus-circle" size={20} color="#2563eb" />
          </View>
          <Text style={styles.title}>Add Item</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* URL Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>URL Preview</Text>
          <View style={styles.inputRow}>
            <Feather name="link" size={16} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="https://example.com/product"
              value={url}
              onChangeText={setUrl}
            />
            <TouchableOpacity
              style={styles.previewButton}
              onPress={fetchPreview}
              accessibilityLabel="Fetch preview for entered URL"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.previewButtonText}>Preview</Text>
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            renderSkeleton()
          ) : preview.title ? (
            <WishlistItemCard
              item={{
                title: preview.title,
                image: preview.image || "",
                price: preview.price || "",
                currency: preview.currency || "",
                source: preview.siteName || "",
                url: "",
                normalizedUrl: "",
              }}
              showLink={false}
              showDelete={false}
            />
          ) : null}
        </View>

        {/* Edit Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Details</Text>

          <View style={styles.inputRowGray}>
            <Feather name="type" size={16} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Item title"
              value={manualTitle}
              onChangeText={setManualTitle}
              editable={!!preview.title}
            />
          </View>

          <View style={styles.inputRowGray}>
            <Feather name="image" size={16} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Image URL (optional)"
              value={manualImage}
              onChangeText={setManualImage}
              editable={!!preview.title}
            />
          </View>

          <View style={styles.inputRowGray}>
            <Feather name="dollar-sign" size={16} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Price (or N/A)"
              value={manualPrice}
              onChangeText={(val) => {
                setManualPrice(val);
                if (isValueNA(val)) setManualCurrency("");
              }}
              editable={!!preview.title}
            />
          </View>

          <View style={styles.inputRowGray}>
            <Feather name="credit-card" size={16} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Currency (e.g., USD, EUR) (Optional)"
              value={manualCurrency}
              onChangeText={setManualCurrency}
              maxLength={3}
              autoCapitalize="characters"
              editable={!!preview.title && !isValueNA(manualPrice)}
            />
          </View>

          <View style={styles.inputRowGray}>
            <Feather name="globe" size={16} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Source domain"
              value={manualSiteName}
              onChangeText={setManualSiteName}
              editable={!!preview.title}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              disableSaveToWishlist() && { opacity: 0.5 },
            ]}
            onPress={saveItem}
            disabled={disableSaveToWishlist()}
            accessibilityLabel="Save item to wishlist"
          >
            <Text style={styles.saveButtonText}>Save to Wishlist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#000" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  inputRowGray: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    marginBottom: 8,
  },
  input: { flex: 1, paddingVertical: 4, color: "#000" },
  previewButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  previewButtonText: { color: "#fff", fontWeight: "500", fontSize: 14 },
  previewCard: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    marginBottom: 12,
  },
  previewImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewContent: { flex: 1, minWidth: 0 },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
