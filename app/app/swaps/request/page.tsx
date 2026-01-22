"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../../lib/user-role";
import { supabase } from "../../../lib/supabase";
import { useRestaurant } from "../../../lib/restaurant-context";

type ShiftOption = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  role: string;
};

type StaffOption = {
  id: string;
  name: string;
  role: string | null;
};

type SwapRequestItem = {
  id: string;
  status: "pending" | "approved" | "rejected";
  shiftLabel: string;
  requestedWithName: string | null;
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
  return `${dayLabel} — ${role} ${formatTime(start)}–${formatTime(end)}`;
};

export default function SwapRequestPage() {
  const router = useRouter();
  const { isManager, loading } = useUserRole();
  const { currentRestaurantId } = useRestaurant();
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const [shiftOptions, setShiftOptions] = useState<ShiftOption[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequestItem[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isManager) {
      router.replace("/app/swaps");
    }
  }, [isManager, loading, router]);

  const loadData = useCallback(async () => {
    if (!currentRestaurantId) return;
    setFetching(true);
    setError(null);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) {
      setFetching(false);
      return;
    }
    const { data: staffRow, error: staffError } = await supabase
      .from("staff")
      .select("id")
      .eq("user_id", userId)
      .eq("restaurant_id", currentRestaurantId)
      .maybeSingle();

    if (staffError || !staffRow?.id) {
      setError(staffError?.message ?? "Unable to load staff profile.");
      setFetching(false);
      return;
    }

    const staffId = staffRow.id;
    setCurrentStaffId(staffId);

    const nowIso = new Date().toISOString();

    const [
      { data: shiftsData, error: shiftsError },
      { data: staffData, error: staffListError },
      { data: swapData, error: swapError },
    ] = await Promise.all([
      supabase
        .from("shifts")
        .select("id, start_time, end_time, role")
        .eq("staff_id", staffId)
        .eq("restaurant_id", currentRestaurantId)
        .gte("start_time", nowIso)
        .order("start_time"),
      supabase
        .from("staff")
        .select("id, name, role")
        .eq("restaurant_id", currentRestaurantId)
        .order("name"),
      supabase
        .from("swap_requests")
        .select(
          "id, status, shift:shift_id ( start_time, end_time, role ), requested_with"
        )
        .eq("requested_by", staffId)
        .eq("restaurant_id", currentRestaurantId)
        .order("created_at", { ascending: false }),
    ]);

    if (shiftsError || staffListError || swapError) {
      setError(
        shiftsError?.message ||
          staffListError?.message ||
          swapError?.message ||
          "Unable to load swap requests."
      );
      setFetching(false);
      return;
    }

    const pendingShiftIds = new Set(
      (swapData ?? [])
        .filter((item) => item.status === "pending")
        .map((item) => item.shift?.id ?? "")
    );

    setShiftOptions(
      (shiftsData ?? [])
        .filter((shift) => !pendingShiftIds.has(shift.id))
        .map((shift) => ({
          id: shift.id,
          label: formatShiftLabel(
            shift.start_time,
            shift.end_time,
            shift.role
          ),
          startTime: shift.start_time,
          endTime: shift.end_time,
          role: shift.role,
        }))
    );

    setStaffOptions(
      (staffData ?? []).map((person) => ({
        id: person.id,
        name: person.name,
        role: person.role ?? null,
      }))
    );

    const staffNameById = new Map(
      (staffData ?? []).map((person) => [person.id, person.name])
    );
    setSwapRequests(
      (swapData ?? []).map((item) => ({
        id: item.id,
        status: item.status,
        shiftLabel: item.shift
          ? formatShiftLabel(
              item.shift.start_time,
              item.shift.end_time,
              item.shift.role
            )
          : "Shift",
        requestedWithName: item.requested_with
          ? staffNameById.get(item.requested_with) ?? "Staff member"
          : null,
      }))
    );

    setFetching(false);
  }, [currentRestaurantId]);

  useEffect(() => {
    if (!isManager && !loading && currentRestaurantId) {
      void loadData();
    }
  }, [currentRestaurantId, isManager, loading, loadData]);

  const staffChoices = useMemo(() => {
    if (!currentStaffId) return [];
    return staffOptions.filter(
      (staff) => staff.id !== currentStaffId && staff.role !== "manager"
    );
  }, [staffOptions, currentStaffId]);

  const handleSubmit = async () => {
    if (!selectedShiftId || !currentStaffId) return;
    setSubmitting(true);
    const { error: submitError } = await supabase.from("swap_requests").insert({
      restaurant_id: currentRestaurantId,
      shift_id: selectedShiftId,
      requested_by: currentStaffId,
      requested_with: selectedStaffId || null,
    });
    setSubmitting(false);
    if (submitError) {
      setError(submitError.message);
      return;
    }
    setSelectedShiftId("");
    setSelectedStaffId("");
    setFormOpen(false);
    await loadData();
  };

  const emptyState = !fetching && !error && swapRequests.length === 0;

  if (isManager) {
    return null;
  }

  if (!currentRestaurantId && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Select a restaurant to request swaps.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Swap requests
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Request a swap for an upcoming shift.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          Request a shift swap
        </button>
      </div>

      {formOpen ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Request a shift swap
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Select shift
              </label>
              <select
                value={selectedShiftId}
                onChange={(event) => setSelectedShiftId(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Choose a shift</option>
                {shiftOptions.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Swap with
              </label>
              <select
                value={selectedStaffId}
                onChange={(event) => setSelectedStaffId(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Any staff member</option>
                {staffChoices.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedShiftId || submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit request
            </button>
          </div>
        </div>
      ) : null}

      {fetching ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
          Loading swap requests...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
          {error}
        </div>
      ) : emptyState ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
          <p>
            Swap requests let you trade shifts with teammates while managers
            stay informed.
          </p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Request a shift swap
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {swapRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {request.shiftLabel}
                </span>
                <span
                  className={`rounded border px-2 py-0.5 text-xs font-semibold ${statusStyles[request.status]}`}
                >
                  {request.status}
                </span>
                <span className="text-xs text-gray-500">
                  {request.requestedWithName
                    ? `Swap with ${request.requestedWithName}`
                    : "Open request"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
