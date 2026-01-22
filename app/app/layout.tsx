"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { UserRoleProvider, useUserRole } from "../lib/user-role";
import { useRestaurant } from "../lib/restaurant-context";

type NavItem = {
  name: string;
  href: string;
};

const managerNav: NavItem[] = [
  { name: "Dashboard", href: "/app" },
  { name: "Rota", href: "/app/rota" },
  { name: "Swaps", href: "/app/swaps" },
  { name: "Holidays", href: "/app/holidays" },
];

const staffNav: NavItem[] = [
  { name: "My rota", href: "/app/my-rota" },
  { name: "Holidays", href: "/app/holidays" },
  { name: "Swap requests", href: "/app/swaps/request" },
];

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading, error, reload } = useUserRole();
  const {
    restaurants,
    currentRestaurantId,
    setCurrentRestaurantId,
    loading: restaurantsLoading,
    error: restaurantError,
  } = useRestaurant();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayEmail = userEmail ? userEmail.split("@")[0] : null;
  const navItems = useMemo(() => {
    if (role === "manager") return managerNav;
    if (role === "staff") return staffNav;
    return [];
  }, [role]);

  if (loading || restaurantsLoading) {
    if (error || restaurantError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
          <div className="max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-base font-semibold text-gray-900">
              Unable to load workspace
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {error ?? restaurantError}
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  if (restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-base font-semibold text-gray-900">
            No restaurants found
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ask an admin to add you to a restaurant.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col">
        <div>
          <Link href="/" className="block text-lg font-semibold">
            Weekline
          </Link>
          {!restaurantsLoading && currentRestaurantId ? (
            <p className="mb-6 mt-1 text-xs text-gray-500">
              {
                restaurants.find(
                  (restaurant) =>
                    restaurant.restaurantId === currentRestaurantId
                )?.restaurantName
              }
            </p>
          ) : (
            <div className="mb-6" />
          )}

          {!restaurantsLoading && restaurants.length > 0 ? (
            <div className="mb-6">
              <select
                value={currentRestaurantId ?? ""}
                onChange={(event) =>
                  setCurrentRestaurantId(event.target.value)
                }
                disabled={restaurants.length === 1}
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                {restaurants.map((restaurant) => (
                  <option
                    key={restaurant.restaurantId}
                    value={restaurant.restaurantId}
                  >
                    {restaurant.restaurantName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {role === "manager" ? (
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const linkClassName = isActive
                  ? "block rounded-md px-3 py-2 text-sm bg-blue-600 text-white"
                  : "block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={linkClassName}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          ) : null}
          {role === "staff" ? (
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const linkClassName = isActive
                  ? "block rounded-md px-3 py-2 text-sm bg-blue-600 text-white"
                  : "block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={linkClassName}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>

        <div className="mt-auto pt-6 space-y-3">
          {displayEmail ? (
            <p className="text-xs text-gray-500">Signed in as {displayEmail}</p>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 text-left"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserRoleProvider>
      <AppShell>{children}</AppShell>
    </UserRoleProvider>
  );
}
