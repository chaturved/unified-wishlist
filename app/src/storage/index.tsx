import AsyncStorage from "@react-native-async-storage/async-storage";
import { WishlistItem } from "../types/WishlistItem";

export const WISHLIST_KEY = "wishlist_v2";

export const normalizeUrl = (url: string) => {
  try {
    const u = new URL(url);
    u.search = ""; // remove query parameters
    u.hash = ""; // remove fragment
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return url; // fallback if invalid URL
  }
};

export const getWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const data = await AsyncStorage.getItem(WISHLIST_KEY);
    const list: WishlistItem[] = data ? JSON.parse(data) : [];

    // Schema migration: add normalizedUrl if missing
    const migrated = list.map((item) => ({
      ...item,
      normalizedUrl: item.normalizedUrl || normalizeUrl(item.url),
    }));

    return migrated;
  } catch (err) {
    console.error("Error reading wishlist", err);
    return [];
  }
};

export const addItemToWishlist = async (item: WishlistItem) => {
  try {
    const list = await getWishlist();

    // Check if item already exists
    const exists = list.some((i) => i.normalizedUrl === item.normalizedUrl);
    if (!exists) {
      list.push(item);
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.error("Error saving wishlist", err);
    throw err;
  }
};

export const removeItemFromWishlist = async (normalizedUrl: string) => {
  try {
    const list = await getWishlist();
    const filtered = list.filter((i) => i.normalizedUrl !== normalizedUrl);
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error removing wishlist item", err);
    throw err;
  }
};

export const clearWishlist = async () => {
  try {
    await AsyncStorage.removeItem(WISHLIST_KEY);
  } catch (err) {
    console.error("Error clearing wishlist", err);
    throw err;
  }
};
