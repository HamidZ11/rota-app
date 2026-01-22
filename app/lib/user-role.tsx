"use client";

import { useMemo } from "react";
import {
  RestaurantProvider,
  useRestaurant,
} from "./restaurant-context";

export function UserRoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RestaurantProvider>
      {children}
    </RestaurantProvider>
  );
}

export function useUserRole() {
  const { currentRole, loading, error, reload } = useRestaurant();
  return useMemo(
    () => ({
      role: currentRole,
      isManager: currentRole === "manager",
      isStaff: currentRole === "staff",
      loading,
      error,
      reload,
    }),
    [currentRole, error, loading, reload]
  );
}
