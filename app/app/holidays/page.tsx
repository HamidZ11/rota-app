"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../lib/user-role";
import { supabase } from "../../lib/supabase";
import { one } from "../../lib/supabase-join";
import { useRestaurant } from "../../lib/restaurant-context";

type HolidayRequest = {
  id: string;
  staffId: string;
  staffName: string | null;
  startDate: string;
  endDate: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

type Holiday = {
  id: string;
  startDate: string;
  endDate: string;
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

const formatDateRange = (start: string, end: string) => {
  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();
  const dayFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
  });
  const monthFormatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
  });
  const startDay = dayFormatter.format(startDate);
  const endDay = dayFormatter.format(endDate);
  const startMonth = monthFormatter.format(startDate);
  const endMonth = monthFormatter.format(endDate);

  if (start === end) return `${startDay} ${startMonth}`;
  if (sameMonth) return `${startDay}–${endDay} ${startMonth}`;
  return `${startDay} ${startMonth}–${endDay} ${endMonth}`;
};

const statusStyles: Record<HolidayRequest["status"], string> = {
  pending: "bg-gray-100 text-gray-600",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function HolidaysPage() {
  const router = useRouter();
  const { role, loading } = useUserRole();
  const { currentRestaurantId } = useRestaurant();

  const [staffId, setStaffId] = useState<string | null>(null);
  const [requests, setRequests] = useState<HolidayRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestStart, setRequestStart] = useState(
    formatDateInput(new Date())
  );
  const [requestEnd, setRequestEnd] = useState(formatDateInput(new Date()));
  const [requestNote, setRequestNote] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [actionState, setActionState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && role === null) {
      router.replace("/app");
    }
  }, [loading, role, router]);

  const loadStaffId = useCallback(async () => {
    if (!currentRestaurantId) {
      setStaffId(null);
      return;
    }
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) {
      setStaffId(null);
      return;
    }
    const { data: staffRow } = await supabase
      .from("staff")
      .select("id")
      .eq("user_id", userId)
      .eq("restaurant_id", currentRestaurantId)
      .maybeSingle();
    setStaffId(staffRow?.id ?? null);
  }, [currentRestaurantId]);

  const loadStaffRequests = useCallback(async () => {
    if (!staffId) return;
    const { data, error: fetchError } = await supabase
      .from("holiday_requests")
      .select(
        "id, staff_id, start_date, end_date, note, status, created_at, reviewed_at, reviewed_by"
      )
      .eq("staff_id", staffId)
      .eq("restaurant_id", currentRestaurantId)
      .order("created_at", { ascending: false });
    if (fetchError || !data) {
      setError(fetchError?.message ?? "Unable to load holiday requests.");
      return;
    }
    setRequests(
      data.map((row) => ({
        id: row.id,
        staffId: row.staff_id,
        staffName: null,
        startDate: row.start_date,
        endDate: row.end_date,
        note: row.note ?? null,
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at ?? null,
        reviewedBy: row.reviewed_by ?? null,
      }))
    );
  }, [currentRestaurantId, staffId]);

  const loadStaffHolidays = useCallback(async () => {
    if (!staffId) return;
    const { data } = await supabase
      .from("holidays")
      .select("id, start_date, end_date")
      .eq("staff_id", staffId)
      .eq("restaurant_id", currentRestaurantId)
      .order("start_date", { ascending: false });
    setHolidays(
      (data ?? []).map((row) => ({
        id: row.id,
        startDate: row.start_date,
        endDate: row.end_date,
      }))
    );
  }, [currentRestaurantId, staffId]);

  const loadManagerRequests = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("holiday_requests")
      .select(
        "id, staff_id, start_date, end_date, note, status, created_at, reviewed_at, reviewed_by, staff:staff_id ( name )"
      )
      .eq("restaurant_id", currentRestaurantId)
      .order("created_at", { ascending: false });
    if (fetchError || !data) {
      setError(fetchError?.message ?? "Unable to load holiday requests.");
      return;
    }
    setRequests(
      data.map((row) => {
        const staff = one(row.staff);
        return {
          id: row.id,
          staffId: row.staff_id,
          staffName: staff?.name ?? null,
          startDate: row.start_date,
          endDate: row.end_date,
          note: row.note ?? null,
          status: row.status,
          createdAt: row.created_at,
          reviewedAt: row.reviewed_at ?? null,
          reviewedBy: row.reviewed_by ?? null,
        };
      })
    );
  }, [currentRestaurantId]);

  useEffect(() => {
    if (!role) return;
    if (role !== "staff") return;
    if (!currentRestaurantId) return;
    setFetching(true);
    setError(null);
    void loadStaffId().finally(() => setFetching(false));
  }, [currentRestaurantId, loadStaffId, role]);

  useEffect(() => {
    if (role !== "manager") return;
    if (!currentRestaurantId) return;
    setFetching(true);
    setError(null);
    void loadManagerRequests().finally(() => setFetching(false));
  }, [currentRestaurantId, loadManagerRequests, role]);

  useEffect(() => {
    if (role !== "staff") return;
    if (!staffId) return;
    if (!currentRestaurantId) return;
    setFetching(true);
    setError(null);
    const load = async () => {
      await loadStaffRequests();
      await loadStaffHolidays();
    };
    void load().finally(() => setFetching(false));
  }, [currentRestaurantId, loadStaffHolidays, loadStaffRequests, role, staffId]);

  const openRequestModal = () => {
    const today = formatDateInput(new Date());
    setRequestStart(today);
    setRequestEnd(today);
    setRequestNote("");
    setRequestError(null);
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setRequestError(null);
  };

  const handleSubmitRequest = async () => {
    if (!currentRestaurantId) return;
    if (!staffId) return;
    const startDate = parseDateInput(requestStart);
    const endDate = parseDateInput(requestEnd);
    if (endDate.getTime() < startDate.getTime()) {
      setRequestError("End date must be on or after the start date.");
      return;
    }

    const overlapsHoliday = holidays.some((holiday) => {
      const holidayStart = parseDateInput(holiday.startDate);
      const holidayEnd = parseDateInput(holiday.endDate);
      return (
        isDateInRange(startDate, holidayStart, holidayEnd) ||
        isDateInRange(endDate, holidayStart, holidayEnd) ||
        isDateInRange(holidayStart, startDate, endDate)
      );
    });

    if (overlapsHoliday) {
      setRequestError("This overlaps an approved holiday.");
      return;
    }

    const overlapsPending = requests.some((request) => {
      if (request.status !== "pending") return false;
      const requestStartDate = parseDateInput(request.startDate);
      const requestEndDate = parseDateInput(request.endDate);
      return (
        isDateInRange(startDate, requestStartDate, requestEndDate) ||
        isDateInRange(endDate, requestStartDate, requestEndDate) ||
        isDateInRange(requestStartDate, startDate, endDate)
      );
    });

    if (overlapsPending) {
      setRequestError("This overlaps a pending request.");
      return;
    }

    setSaving(true);
    const { error: submitError } = await supabase
      .from("holiday_requests")
      .insert({
        restaurant_id: currentRestaurantId,
        staff_id: staffId,
        start_date: requestStart,
        end_date: requestEnd,
        note: requestNote.trim() || null,
      });
    setSaving(false);
    if (submitError) {
      setRequestError(submitError.message);
      return;
    }
    await loadStaffRequests();
    closeRequestModal();
  };

  const resolveRequest = async (
    request: HolidayRequest,
    nextStatus: "approved" | "rejected"
  ) => {
    if (!currentRestaurantId) return;
    setActionState((prev) => ({ ...prev, [request.id]: nextStatus }));
    const { data: authData } = await supabase.auth.getUser();
    const reviewerId = authData.user?.id ?? null;

    if (nextStatus === "approved") {
      const { data: existing } = await supabase
        .from("holidays")
        .select("id")
        .eq("staff_id", request.staffId)
        .eq("restaurant_id", currentRestaurantId)
        .lte("start_date", request.endDate)
        .gte("end_date", request.startDate);

      if (existing && existing.length > 0) {
        setError("This request overlaps an approved holiday.");
        setActionState((prev) => {
          const next = { ...prev };
          delete next[request.id];
          return next;
        });
        return;
      }

      const rangeStart = parseDateInput(request.startDate);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = parseDateInput(request.endDate);
      rangeEnd.setHours(0, 0, 0, 0);
      rangeEnd.setDate(rangeEnd.getDate() + 1);

      const { data: shiftsInRange } = await supabase
        .from("shifts")
        .select("id")
        .eq("staff_id", request.staffId)
        .eq("restaurant_id", currentRestaurantId)
        .gte("start_time", rangeStart.toISOString())
        .lt("start_time", rangeEnd.toISOString());

      if (shiftsInRange && shiftsInRange.length > 0) {
        const confirmRemove = window.confirm(
          `This approval overlaps ${shiftsInRange.length} shift${
            shiftsInRange.length === 1 ? "" : "s"
          }. Remove them?`
        );
        if (!confirmRemove) {
          setActionState((prev) => {
            const next = { ...prev };
            delete next[request.id];
            return next;
          });
          return;
        }
        await supabase
          .from("shifts")
          .delete()
          .in(
            "id",
            shiftsInRange.map((shift) => shift.id)
          );
      }

      const { error: holidayError } = await supabase
        .from("holidays")
        .insert({
          restaurant_id: currentRestaurantId,
          staff_id: request.staffId,
          start_date: request.startDate,
          end_date: request.endDate,
          reason: request.note ?? null,
          created_by: reviewerId,
        });
      if (holidayError) {
        setError(holidayError.message);
        setActionState((prev) => {
          const next = { ...prev };
          delete next[request.id];
          return next;
        });
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("holiday_requests")
      .update({
        status: nextStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq("id", request.id)
      .eq("restaurant_id", currentRestaurantId);

    if (updateError) {
      setError(updateError.message);
    } else {
      await loadManagerRequests();
    }

    setActionState((prev) => {
      const next = { ...prev };
      delete next[request.id];
      return next;
    });
  };

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests]
  );

  const resolvedRequests = useMemo(
    () => requests.filter((request) => request.status !== "pending"),
    [requests]
  );

  if (loading || role === null) return null;

  if (!currentRestaurantId && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Select a restaurant to manage holidays.
      </div>
    );
  }

  if (role === "manager") {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Holiday requests
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review staff time off requests.
            </p>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
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
        ) : pendingRequests.length === 0 && resolvedRequests.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            No holiday requests yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">Pending</h2>
              {pendingRequests.length === 0 ? (
                <p className="mt-3 text-xs text-gray-500">
                  Nothing waiting for review.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {pendingRequests.map((request) => {
                    const isProcessing = Boolean(actionState[request.id]);
                    return (
                      <div
                        key={request.id}
                        className="rounded-md border border-gray-200 bg-white p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {request.staffName ?? "Staff"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateRange(
                                request.startDate,
                                request.endDate
                              )}
                            </p>
                          </div>
                          <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold bg-gray-100 text-gray-600">
                            pending
                          </span>
                        </div>
                        {request.note ? (
                          <p className="mt-2 text-xs text-gray-600">
                            {request.note}
                          </p>
                        ) : null}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => resolveRequest(request, "approved")}
                            disabled={isProcessing}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveRequest(request, "rejected")}
                            disabled={isProcessing}
                            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">Reviewed</h2>
              {resolvedRequests.length === 0 ? (
                <p className="mt-3 text-xs text-gray-500">
                  No reviewed requests yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {resolvedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-md border border-gray-200 bg-white p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {request.staffName ?? "Staff"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateRange(
                              request.startDate,
                              request.endDate
                            )}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[request.status]}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      {request.note ? (
                        <p className="mt-2 text-xs text-gray-600">
                          {request.note}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!staffId && !fetching) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No staff profile found for this account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Your holidays
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Request time off for upcoming dates.
          </p>
        </div>
        <button
          type="button"
          onClick={openRequestModal}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          Request holiday
        </button>
      </div>

      {fetching ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
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
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No holiday requests yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-[1.2fr_0.8fr_1.2fr] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
            <span>Date range</span>
            <span>Status</span>
            <span>Note</span>
          </div>
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div
                key={request.id}
                className="grid grid-cols-[1.2fr_0.8fr_1.2fr] gap-4 px-4 py-3 text-sm text-gray-700"
              >
                <span className="font-medium text-gray-900">
                  {formatDateRange(request.startDate, request.endDate)}
                </span>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[request.status]}`}
                >
                  {request.status}
                </span>
                <span className="text-xs text-gray-600">
                  {request.note ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {requestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Request holiday
              </h2>
              <p className="text-xs text-gray-500">
                Submit a new time off request.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={requestStart}
                    onChange={(event) => setRequestStart(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    End date
                  </label>
                  <input
                    type="date"
                    value={requestEnd}
                    onChange={(event) => setRequestEnd(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Optional note
                </label>
                <textarea
                  value={requestNote}
                  onChange={(event) => setRequestNote(event.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {requestError ? (
                <p className="text-xs text-red-600">{requestError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={saving}
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
