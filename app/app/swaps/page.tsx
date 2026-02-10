"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../lib/user-role";
import { supabase } from "../../lib/supabase";
import { one } from "../../lib/supabase-join";
import { useRestaurant } from "../../lib/restaurant-context";

type StaffRow = {
  id: string;
  name: string;
  userId: string | null;
};

type SwapRequest = {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  requesterStaffId: string | null;
  targetStaffId: string | null;
  shift: {
    id: string;
    startTime: string;
    endTime: string;
    role: string;
    staffId: string | null;
  };
};

const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
};

const formatTime = (dateString: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateString));

const formatShiftLabel = (start: string, end: string, role: string) => {
  const startDate = new Date(start);
  const dayLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(startDate);
  return `${dayLabel} · ${role} ${formatTime(start)}–${formatTime(end)}`;
};

export default function SwapsPage() {
  const router = useRouter();
  const { isManager, loading } = useUserRole();
  const { currentRestaurantId } = useRestaurant();
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isManager) {
      router.replace("/app/swaps/request");
    }
  }, [isManager, loading, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadSwaps = useCallback(async () => {
    if (!currentRestaurantId) return;
    setFetching(true);
    setError(null);
    const { data: authData } = await supabase.auth.getUser();
    setCurrentUserId(authData.user?.id ?? null);

    const [
      { data: swapData, error: swapError },
      { data: staffData, error: staffError },
    ] = await Promise.all([
      supabase
        .from("swap_requests")
        .select(
          "id, status, created_at, requested_by, requested_with, shift:shift_id ( id, start_time, end_time, role, staff_id )"
        )
        .eq("restaurant_id", currentRestaurantId)
        .order("created_at", { ascending: false }),
      supabase
        .from("staff")
        .select("id, name, user_id")
        .eq("restaurant_id", currentRestaurantId)
        .order("name"),
    ]);

    if (swapError || staffError) {
      setError(
        swapError?.message ||
          staffError?.message ||
          "Unable to load swap requests."
      );
      setFetching(false);
      return;
    }

    setStaff(
      (staffData ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        userId: row.user_id ?? null,
      }))
    );

    setSwaps(
      (swapData ?? []).map((row) => {
        const shift = one(row.shift);
        return {
          id: row.id,
          status: row.status,
          createdAt: row.created_at,
          requesterStaffId: row.requested_by ?? null,
          targetStaffId: row.requested_with ?? null,
          shift: {
            id: shift?.id ?? "",
            startTime: shift?.start_time ?? "",
            endTime: shift?.end_time ?? "",
            role: shift?.role ?? "",
            staffId: shift?.staff_id ?? null,
          },
        };
      })
    );
    setFetching(false);
  }, [currentRestaurantId]);

  useEffect(() => {
    if (isManager && !loading && currentRestaurantId) {
      void loadSwaps();
    }
  }, [currentRestaurantId, isManager, loading, loadSwaps]);

  const staffById = useMemo(() => {
    const map = new Map<string, StaffRow>();
    staff.forEach((person) => map.set(person.id, person));
    return map;
  }, [staff]);


  const pendingSwaps = useMemo(
    () => swaps.filter((swap) => swap.status === "pending"),
    [swaps]
  );

  const resolvedSwaps = useMemo(
    () => swaps.filter((swap) => swap.status !== "pending"),
    [swaps]
  );

  const resolveSwap = async (swap: SwapRequest, nextStatus: "approved" | "rejected") => {
    if (swap.status !== "pending") return;
    const requesterUserId = swap.requesterStaffId
      ? staffById.get(swap.requesterStaffId)?.userId ?? null
      : null;
    if (requesterUserId && requesterUserId === currentUserId) return;

    setProcessingIds((prev) => ({ ...prev, [swap.id]: nextStatus }));
    setError(null);
    const { error: updateError } = await supabase
      .from("swap_requests")
      .update({ status: nextStatus })
      .eq("id", swap.id);

    if (updateError) {
      setProcessingIds((prev) => {
        const next = { ...prev };
        delete next[swap.id];
        return next;
      });
      setError(updateError.message);
      return;
    }

    if (nextStatus === "approved") {
      const { error: shiftError } = await supabase
        .from("shifts")
        .update({
          staff_id: swap.targetStaffId ?? null,
        })
        .eq("id", swap.shift.id);

      if (shiftError) {
        await supabase
          .from("swap_requests")
          .update({ status: "pending" })
          .eq("id", swap.id);
        setProcessingIds((prev) => {
          const next = { ...prev };
          delete next[swap.id];
          return next;
        });
        setError(shiftError.message);
        return;
      }
    }

    setSwaps((prev) =>
      prev.map((item) =>
        item.id === swap.id ? { ...item, status: nextStatus } : item
      )
    );
    setProcessingIds((prev) => {
      const next = { ...prev };
      delete next[swap.id];
      return next;
    });
    setToast(nextStatus === "approved" ? "Swap approved" : "Swap rejected");
  };

  if (!isManager) {
    return null;
  }

  if (!currentRestaurantId && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Select a restaurant to review swap requests.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Swap requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          Approve or reject staff shift swaps.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Pending requests</h2>
        {fetching ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
            Loading swap requests...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
            {error}
          </div>
        ) : pendingSwaps.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No pending swap requests.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSwaps.map((swap) => {
              const requester = swap.requesterStaffId
                ? staffById.get(swap.requesterStaffId)
                : null;
              const target = swap.targetStaffId
                ? staffById.get(swap.targetStaffId)
                : null;
              const isProcessing = Boolean(processingIds[swap.id]);
              return (
                <div
                  key={swap.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatShiftLabel(
                          swap.shift.startTime,
                          swap.shift.endTime,
                          swap.shift.role
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Requested by{" "}
                        <span className="font-medium text-gray-900">
                          {requester?.name ?? "Staff member"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Swap target:{" "}
                        <span className="font-medium text-gray-900">
                          {target?.name ?? "Any available staff"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-semibold ${statusStyles.pending}`}
                      >
                        pending
                      </span>
                      <button
                        type="button"
                        onClick={() => resolveSwap(swap, "approved")}
                        disabled={isProcessing}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveSwap(swap, "rejected")}
                        disabled={isProcessing}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowResolved((prev) => !prev)}
          className="text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          {showResolved ? "Hide" : "Show"} resolved requests
          {resolvedSwaps.length ? ` (${resolvedSwaps.length})` : ""}
        </button>

        {showResolved ? (
          resolvedSwaps.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
              No resolved swap requests.
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedSwaps.map((swap) => {
                const requester = swap.requesterStaffId
                  ? staffById.get(swap.requesterStaffId)
                  : null;
                const target = swap.targetStaffId
                  ? staffById.get(swap.targetStaffId)
                  : null;
                return (
                  <div
                    key={swap.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatShiftLabel(
                            swap.shift.startTime,
                            swap.shift.endTime,
                            swap.shift.role
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Requested by{" "}
                          <span className="font-medium text-gray-900">
                            {requester?.name ?? "Staff member"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Swap target:{" "}
                          <span className="font-medium text-gray-900">
                            {target?.name ?? "Any available staff"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                          statusStyles[swap.status]
                        }`}
                      >
                        {swap.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : null}
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
