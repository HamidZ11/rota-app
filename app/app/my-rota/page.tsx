"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../lib/user-role";
import { supabase } from "../../lib/supabase";
import { useRestaurant } from "../../lib/restaurant-context";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type ShiftItem = {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
  role: string;
  durationLabel: string;
};

type Holiday = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
};

type HolidayRequest = {
  id: string;
  startDate: string;
  endDate: string;
};

type StaffOption = {
  id: string;
  name: string;
  userId: string | null;
  role: string | null;
};

type SwapRequest = {
  id: string;
  shiftId: string;
  status: "pending" | "approved" | "rejected";
  requestedWithId: string | null;
};

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const roleStyles: Record<string, string> = {
  SV: "border-purple-300 bg-purple-50 text-purple-900",
  BT: "border-orange-300 bg-orange-50 text-orange-900",
  R: "border-blue-300 bg-blue-50 text-blue-900",
  FOH: "border-emerald-300 bg-emerald-50 text-emerald-900",
  BOH: "border-red-300 bg-red-50 text-red-900",
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

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const formatDuration = (start: Date, end: Date) => {
  const diffMinutes = Math.max(0, (end.getTime() - start.getTime()) / 60000);
  const hours = diffMinutes / 60;
  return `${hours.toFixed(1)}h`;
};

const formatDayDate = (weekStart: Date, day: Day) => {
  const dayIndex = days.indexOf(day);
  const date = addDays(weekStart, dayIndex);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const formatDayHeader = (weekStart: Date, day: Day) => {
  const dayIndex = days.indexOf(day);
  const date = addDays(weekStart, dayIndex);
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
  }).format(date);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
  return `${weekday} — ${dateLabel}`;
};

const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return days[dayIndex];
};

const formatHolidayRange = (holiday: Holiday) => {
  const startDate = parseDateInput(holiday.startDate);
  const endDate = parseDateInput(holiday.endDate);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const startLabel = formatter.format(startDate);
  const endLabel = formatter.format(endDate);
  return startLabel === endLabel ? startLabel : `${startLabel}–${endLabel}`;
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const isDateInRange = (date: Date, start: Date, end: Date) =>
  date.getTime() >= start.getTime() && date.getTime() <= end.getTime();

export default function MyRotaPage() {
  const router = useRouter();
  const { isManager, loading } = useUserRole();
  const { currentRestaurantId } = useRestaurant();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [pendingRequests, setPendingRequests] = useState<HolidayRequest[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapShiftId, setSwapShiftId] = useState<string | null>(null);
  const [swapShiftLabel, setSwapShiftLabel] = useState("");
  const [swapRequestedWith, setSwapRequestedWith] = useState<string>("");
  const [swapSaving, setSwapSaving] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  const todayLabel = useMemo(() => {
    const now = new Date();
    const currentWeekKey = getWeekStart(now).toDateString();
    if (currentWeekKey !== weekStart.toDateString()) return null;
    return getDayFromDate(now);
  }, [weekStart]);

  const loadShifts = useCallback(async () => {
    setFetching(true);
    setError(null);
    if (!currentRestaurantId) {
      setShifts([]);
      setHolidays([]);
      setPendingRequests([]);
      setSwapRequests([]);
      setFetching(false);
      return;
    }
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) {
      setShifts([]);
      setFetching(false);
      return;
    }

    const { data: staffRow } = await supabase
      .from("staff")
      .select("id")
      .eq("user_id", userId)
      .eq("restaurant_id", currentRestaurantId)
      .maybeSingle();
    const staffId = staffRow?.id ?? null;
    setCurrentStaffId(staffId);
    if (!staffId) {
      setShifts([]);
      setHolidays([]);
      setPendingRequests([]);
      setSwapRequests([]);
      setFetching(false);
      return;
    }

    const rangeStart = new Date(weekStart);
    const rangeEnd = addDays(weekStart, 7);
    const { data, error: fetchError } = await supabase
      .from("shifts")
      .select("id, start_time, end_time, role")
      .eq("staff_id", staffId)
      .eq("restaurant_id", currentRestaurantId)
      .gte("start_time", rangeStart.toISOString())
      .lt("start_time", rangeEnd.toISOString())
      .order("start_time");

    if (fetchError || !data) {
      setError(fetchError?.message ?? "Unable to load shifts.");
      setFetching(false);
      return;
    }

    setShifts(
      data.map((row) => {
        const startDate = new Date(row.start_time);
        const endDate = new Date(row.end_time);
        return {
          id: row.id,
          day: getDayFromDate(startDate),
          role: row.role,
          startTime: formatTime(startDate),
          endTime: formatTime(endDate),
          durationLabel: formatDuration(startDate, endDate),
        };
      })
    );
    const shiftIds = data.map((row) => row.id);
    if (shiftIds.length > 0) {
      const { data: swapData } = await supabase
        .from("swap_requests")
        .select("id, shift_id, status, requested_with")
        .in("shift_id", shiftIds)
        .eq("restaurant_id", currentRestaurantId)
        .order("created_at", { ascending: false });
      if (swapData) {
        setSwapRequests(
          swapData.map((row) => ({
            id: row.id,
            shiftId: row.shift_id,
            status: row.status,
            requestedWithId: row.requested_with ?? null,
          }))
        );
      }
    } else {
      setSwapRequests([]);
    }

    const holidayRangeStart = formatDateInput(weekStart);
    const holidayRangeEnd = formatDateInput(addDays(weekStart, 6));
    const { data: holidayData } = await supabase
      .from("holidays")
      .select("id, start_date, end_date, reason")
      .eq("staff_id", staffId)
      .eq("restaurant_id", currentRestaurantId)
      .lte("start_date", holidayRangeEnd)
      .gte("end_date", holidayRangeStart)
      .order("start_date");
    if (holidayData) {
      setHolidays(
        holidayData.map((row) => ({
          id: row.id,
          startDate: row.start_date,
          endDate: row.end_date,
          reason: row.reason ?? null,
        }))
      );
    } else {
      setHolidays([]);
    }

    const requestRangeStart = formatDateInput(weekStart);
    const requestRangeEnd = formatDateInput(addDays(weekStart, 6));
    const { data: requestData } = await supabase
      .from("holiday_requests")
      .select("id, start_date, end_date, status")
      .eq("staff_id", staffId)
      .eq("restaurant_id", currentRestaurantId)
      .eq("status", "pending")
      .lte("start_date", requestRangeEnd)
      .gte("end_date", requestRangeStart);
    if (requestData) {
      setPendingRequests(
        requestData.map((row) => ({
          id: row.id,
          startDate: row.start_date,
          endDate: row.end_date,
        }))
      );
    } else {
      setPendingRequests([]);
    }
    setFetching(false);
  }, [currentRestaurantId, weekStart]);

  const loadStaffOptions = useCallback(async () => {
    const { data, error: staffError } = await supabase
      .from("staff")
      .select("id, name, user_id, role")
      .eq("restaurant_id", currentRestaurantId)
      .order("name");
    if (staffError || !data) return;
    setStaffOptions(
      data.map((row) => ({
        id: row.id,
        name: row.name,
        userId: row.user_id ?? null,
        role: row.role ?? null,
      }))
    );
  }, [currentRestaurantId]);

  const shiftsByDay = useMemo(() => {
    const grouped: Record<Day, ShiftItem[]> = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };
    shifts.forEach((shift) => grouped[shift.day].push(shift));
    days.forEach((day) => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [shifts]);

  const holidayByDay = useMemo(() => {
    const map = new Map<Day, Holiday>();
    holidays.forEach((holiday) => {
      const startDate = parseDateInput(holiday.startDate);
      const endDate = parseDateInput(holiday.endDate);
      days.forEach((day) => {
        const date = addDays(weekStart, days.indexOf(day));
        if (isDateInRange(date, startDate, endDate)) {
          map.set(day, holiday);
        }
      });
    });
    return map;
  }, [holidays, weekStart]);

  const pendingByDay = useMemo(() => {
    const map = new Map<Day, HolidayRequest>();
    pendingRequests.forEach((request) => {
      const startDate = parseDateInput(request.startDate);
      const endDate = parseDateInput(request.endDate);
      days.forEach((day) => {
        const date = addDays(weekStart, days.indexOf(day));
        if (isDateInRange(date, startDate, endDate)) {
          map.set(day, request);
        }
      });
    });
    return map;
  }, [pendingRequests, weekStart]);

  useEffect(() => {
    if (!loading && isManager) {
      router.replace("/app/rota");
    }
  }, [isManager, loading, router]);

  useEffect(() => {
    if (!currentRestaurantId) return;
    void loadShifts();
  }, [loadShifts]);

  useEffect(() => {
    if (!currentRestaurantId) return;
    void loadStaffOptions();
  }, [loadStaffOptions]);

  const swapRequestByShift = useMemo(() => {
    const map = new Map<string, SwapRequest>();
    swapRequests.forEach((request) => {
      if (!map.has(request.shiftId)) {
        map.set(request.shiftId, request);
      }
    });
    return map;
  }, [swapRequests]);

  const openSwapModal = (shift: ShiftItem) => {
    setSwapShiftId(shift.id);
    setSwapRequestedWith("");
    setSwapError(null);
    setSwapShiftLabel(`${shift.role} ${shift.startTime}–${shift.endTime}`);
    setSwapModalOpen(true);
  };

  const closeSwapModal = () => {
    setSwapModalOpen(false);
    setSwapShiftId(null);
    setSwapRequestedWith("");
    setSwapError(null);
  };

  const handleSwapRequest = async () => {
    if (!swapShiftId || !currentStaffId) return;
    const existing = swapRequestByShift.get(swapShiftId);
    if (existing?.status === "pending") {
      setSwapError("A pending request already exists for this shift.");
      return;
    }
    setSwapSaving(true);
    const { error: requestError } = await supabase
      .from("swap_requests")
      .insert({
        restaurant_id: currentRestaurantId,
        shift_id: swapShiftId,
        requested_by: currentStaffId,
        requested_with: swapRequestedWith || null,
      });
    setSwapSaving(false);
    if (requestError) {
      setSwapError(requestError.message);
      return;
    }
    await loadShifts();
    closeSwapModal();
  };

  if (isManager) {
    return null;
  }

  if (!currentRestaurantId && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Select a restaurant to view your rota.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My rota</h1>
          <p className="mt-1 text-sm text-gray-600">
            Your shifts for the selected week.
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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-16 animate-pulse rounded-lg border border-gray-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const dayHoliday = holidayByDay.get(day);
            const dayShifts = dayHoliday ? [] : shiftsByDay[day];
            return (
              <div
                key={day}
                className={`rounded-lg border border-gray-200 bg-white p-4 ${
                  day === todayLabel ? "bg-blue-50/40" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {formatDayHeader(weekStart, day)}
                  </h2>
                  <span
                    className={`text-xs text-gray-500 ${
                      pendingByDay.has(day) && !holidayByDay.has(day)
                        ? "border-b border-dotted border-amber-300/80"
                        : ""
                    }`}
                    title={
                      pendingByDay.has(day) && !holidayByDay.has(day)
                        ? "Holiday request pending"
                        : undefined
                    }
                  >
                    {formatDayDate(weekStart, day)}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {dayHoliday ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-md bg-amber-50/70 px-3 py-2 text-sm text-amber-700">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Holiday
                      </span>
                      <span className="text-xs text-amber-700/80">
                        {formatHolidayRange(dayHoliday)}
                      </span>
                      {dayHoliday.reason ? (
                        <span className="text-xs text-amber-700/80">
                          {dayHoliday.reason}
                        </span>
                      ) : null}
                    </div>
                  ) : dayShifts.length > 0 ? (
                    dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                      >
                        <span
                          className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                            roleStyles[shift.role] ??
                            "border-gray-200 bg-gray-50"
                          }`}
                        >
                          {shift.role}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {shift.startTime}–{shift.endTime}
                        </span>
                        <span className="text-xs text-gray-500">
                          {shift.durationLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => openSwapModal(shift)}
                          disabled={
                            swapRequestByShift.get(shift.id)?.status ===
                            "pending"
                          }
                          className="ml-auto rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Request swap
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      Off
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {swapModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Request swap
              </h2>
              <p className="text-xs text-gray-500">{swapShiftLabel}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Swap with (optional)
                </label>
                <select
                  value={swapRequestedWith}
                  onChange={(event) => setSwapRequestedWith(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Anyone can take</option>
                  {staffOptions
                    .filter(
                      (option) =>
                        option.id !== currentStaffId &&
                        option.role !== "manager"
                    )
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
              {swapError ? (
                <p className="text-xs text-red-600">{swapError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeSwapModal}
                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSwapRequest}
                disabled={swapSaving}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
