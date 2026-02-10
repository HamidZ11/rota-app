"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "./supabase";
import { one } from "./supabase-join";

export type RestaurantRole = "manager" | "staff";

export type RestaurantMembership = {
  memberId: string;
  restaurantId: string;
  restaurantName: string;
  role: RestaurantRole;
};

type RestaurantContextValue = {
  restaurants: RestaurantMembership[];
  currentRestaurantId: string | null;
  currentRole: RestaurantRole | null;
  loading: boolean;
  error: string | null;
  setCurrentRestaurantId: (restaurantId: string) => void;
  reload: () => void;
};

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

const STORAGE_KEY = "weekline.restaurantId";

const resolveSelection = (
  memberships: RestaurantMembership[],
  storedId: string | null
) => {
  if (storedId) {
    const match = memberships.find(
      (membership) => membership.restaurantId === storedId
    );
    if (match) return match.restaurantId;
  }
  if (memberships.length === 1) return memberships[0].restaurantId;
  if (memberships.length > 0) return memberships[0].restaurantId;
  return null;
};

export function RestaurantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [restaurants, setRestaurants] = useState<RestaurantMembership[]>([]);
  const [currentRestaurantId, setCurrentRestaurantIdState] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        setRestaurants([]);
        setCurrentRestaurantIdState(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("restaurant_members")
        .select(
          "id, role, restaurant_id, restaurant:restaurant_id ( id, name )"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (fetchError || !data) {
        throw new Error(fetchError?.message ?? "Unable to load restaurants.");
      }

      const memberships = data
        .map((row) => {
          const restaurant = one(row.restaurant);
          return {
            memberId: row.id,
            restaurantId: restaurant?.id ?? row.restaurant_id ?? "",
            restaurantName: restaurant?.name ?? "Restaurant",
            role: row.role as RestaurantRole,
          };
        })
        .filter((membership) => Boolean(membership.restaurantId));

      setRestaurants(memberships);

      const storedId =
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(STORAGE_KEY);
      const nextId = resolveSelection(memberships, storedId);
      setCurrentRestaurantIdState(nextId);
      if (nextId && typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, nextId);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load restaurants.";
      console.error("Restaurant load failed:", err);
      setRestaurants([]);
      setCurrentRestaurantIdState(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const guardedLoad = async () => {
      if (!active) return;
      await loadRestaurants();
    };

    guardedLoad();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      guardedLoad();
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadRestaurants]);

  const setCurrentRestaurantId = useCallback((restaurantId: string) => {
    setCurrentRestaurantIdState(restaurantId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, restaurantId);
    }
  }, []);

  const currentRole = useMemo(() => {
    const match = restaurants.find(
      (membership) => membership.restaurantId === currentRestaurantId
    );
    return match?.role ?? null;
  }, [currentRestaurantId, restaurants]);

  const value = useMemo(
    () => ({
      restaurants,
      currentRestaurantId,
      currentRole,
      loading,
      error,
      setCurrentRestaurantId,
      reload: loadRestaurants,
    }),
    [
      currentRestaurantId,
      currentRole,
      error,
      loading,
      loadRestaurants,
      restaurants,
      setCurrentRestaurantId,
    ]
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error("useRestaurant must be used within RestaurantProvider.");
  }
  return ctx;
}
