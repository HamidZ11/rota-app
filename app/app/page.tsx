"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useUserRole } from "../lib/user-role";
import { useRestaurant } from "../lib/restaurant-context";

type StaffRow = {
  id: string;
  name: string;
  role: string | null;
};

type ShiftRow = {
  id: string;
  staffId: string | null;
  startTime: string;
  endTime: string;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const expectedShiftsPerDay = 6;
const weeklyHoursMin = 20;
const weeklyHoursMax = 40;
const workloadStatusStyles: Record<string, string> = {
  "On target": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Under target": "border-amber-200 bg-amber-50 text-amber-800",
  "Over target": "border-orange-200 bg-orange-50 text-orange-800",
};

const getWeekStart = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const formatHours = (hours: number) => {
  if (Number.isNaN(hours)) return "0h";
  return `${hours.toFixed(1)}h`;
};

export default function Page() {
  const router = useRouter();
  const { isManager, loading } = useUserRole();
  const { currentRestaurantId } = useRestaurant();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [pendingSwaps, setPendingSwaps] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isManager) {
      router.replace("/app/my-rota");
    }
  }, [isManager, loading, router]);

  const loadData = useCallback(async () => {
    if (!currentRestaurantId) return;
    setFetching(true);
    setError(null);
    const rangeStart = new Date(weekStart);
    const rangeEnd = addDays(weekStart, 7);

    const [{ data: staffData, error: staffError }, { data: shiftData, error: shiftError }, { data: swapData, error: swapError }] =
      await Promise.all([
        supabase
          .from("staff")
          .select("id, name, role")
          .eq("restaurant_id", currentRestaurantId)
          .order("name"),
        supabase
          .from("shifts")
          .select("id, staff_id, start_time, end_time")
          .eq("restaurant_id", currentRestaurantId)
          .gte("start_time", rangeStart.toISOString())
          .lt("start_time", rangeEnd.toISOString()),
        supabase
          .from("swap_requests")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", currentRestaurantId)
          .eq("status", "pending"),
      ]);

    if (staffError || shiftError || swapError) {
      setError(
        staffError?.message ||
          shiftError?.message ||
          swapError?.message ||
          "Unable to load dashboard data."
      );
      setFetching(false);
      return;
    }

    setStaff(
      (staffData ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role ?? null,
      }))
    );
    setShifts(
      (shiftData ?? []).map((row) => ({
        id: row.id,
        staffId: row.staff_id ?? null,
        startTime: row.start_time,
        endTime: row.end_time,
      }))
    );
    setPendingSwaps(swapData?.length ?? 0);
    setFetching(false);
  }, [currentRestaurantId, weekStart]);

  useEffect(() => {
    if (isManager && !loading && currentRestaurantId) {
      void loadData();
    }
  }, [currentRestaurantId, isManager, loading, loadData]);

  const weekSummary = useMemo(() => {
    const totalShifts = shifts.length;
    const uncoveredShifts = shifts.filter((shift) => !shift.staffId).length;
    const expectedShifts = expectedShiftsPerDay * days.length;
    const filledShifts = totalShifts - uncoveredShifts;
    const coverageScore = expectedShifts
      ? Math.round((filledShifts / expectedShifts) * 100)
      : 0;

    return { uncoveredShifts, coverageScore };
  }, [shifts]);

  const staffWorkload = useMemo(() => {
    const staffMap = new Map<string, { shifts: number; hours: number }>();
    shifts.forEach((shift) => {
      if (!shift.staffId) return;
      const start = new Date(shift.startTime).getTime();
      const end = new Date(shift.endTime).getTime();
      const hours = Math.max(0, (end - start) / 36e5);
      const existing = staffMap.get(shift.staffId) ?? { shifts: 0, hours: 0 };
      staffMap.set(shift.staffId, {
        shifts: existing.shifts + 1,
        hours: existing.hours + hours,
      });
    });

    return staff
      .filter((person) => person.role !== "manager")
      .map((person) => {
        const workload = staffMap.get(person.id) ?? { shifts: 0, hours: 0 };
        let status = "On target";
        if (workload.hours < weeklyHoursMin) status = "Under target";
        if (workload.hours > weeklyHoursMax) status = "Over target";
        return {
          ...person,
          shifts: workload.shifts,
          hours: workload.hours,
          status,
        };
      });
  }, [shifts, staff]);

  const staffAtRiskCount = useMemo(() => {
    return staffWorkload.filter(
      (person) => person.status !== "On target"
    ).length;
  }, [staffWorkload]);

  const unassignedShiftCount = useMemo(
    () => shifts.filter((shift) => !shift.staffId).length,
    [shifts]
  );

  if (!isManager) {
    return null;
  }

  if (!currentRestaurantId && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Select a restaurant to view the dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Manager dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manager overview for the current week.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-1 text-xs text-gray-600">
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            ← Previous week
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(getWeekStart(new Date()))}
            className="rounded bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            Next week →
          </button>
        </div>
      </div>

      {fetching ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
          {error}
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              This Week Overview
            </h2>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Uncovered shifts
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {weekSummary.uncoveredShifts}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Coverage score
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {weekSummary.coverageScore}%
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Staff at risk
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {staffAtRiskCount}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Swap pressure
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {pendingSwaps}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Staff workload
            </h2>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Staff</th>
                    <th className="px-4 py-3 font-medium">Shifts</th>
                    <th className="px-4 py-3 font-medium">Hours</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staffWorkload.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 text-gray-900">
                        {person.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {person.shifts}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatHours(person.hours)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                            workloadStatusStyles[person.status] ??
                            "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {person.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Action required
            </h2>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm">
              {pendingSwaps === 0 && unassignedShiftCount === 0 ? (
                <p className="text-gray-600">All clear this week.</p>
              ) : (
                <div className="space-y-2">
                  {pendingSwaps > 0 ? (
                    <p>
                      {pendingSwaps} pending swap request
                      {pendingSwaps > 1 ? "s" : ""} ·{" "}
                      <Link
                        href="/app/swaps"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Review swaps
                      </Link>
                    </p>
                  ) : null}
                  {unassignedShiftCount > 0 ? (
                    <p>{unassignedShiftCount} unassigned shifts</p>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
