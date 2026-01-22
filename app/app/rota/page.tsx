"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../lib/user-role";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import { useRestaurant } from "../../lib/restaurant-context";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type Staff = {
  id: string;
  name: string;
  userId: string | null;
  role: string | null;
};

type ProfileOption = {
  id: string;
  email: string | null;
};

type Assignment = {
  id: string;
  staffId: string;
  day: Day;
  role: string;
  startTime: string;
  endTime: string;
};

type Holiday = {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdBy: string | null;
};

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const roleOptions = ["SV", "BT", "R", "FOH", "BOH"];
const roleStyles: Record<
  string,
  { pill: string; legend: string }
> = {
  SV: {
    pill: "border-purple-300 bg-purple-50 text-purple-900",
    legend: "border-purple-200 bg-purple-100 text-purple-800",
  },
  BT: {
    pill: "border-orange-300 bg-orange-50 text-orange-900",
    legend: "border-orange-200 bg-orange-100 text-orange-800",
  },
  R: {
    pill: "border-blue-300 bg-blue-50 text-blue-900",
    legend: "border-blue-200 bg-blue-100 text-blue-800",
  },
  FOH: {
    pill: "border-emerald-300 bg-emerald-50 text-emerald-900",
    legend: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  BOH: {
    pill: "border-red-300 bg-red-50 text-red-900",
    legend: "border-red-200 bg-red-100 text-red-800",
  },
};

const isValidTimeRange = (start: string, end: string) =>
  Boolean(start && end) && start < end;

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

const formatWeekKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDayDate = (weekStart: Date, day: Day) => {
  const dayIndex = days.indexOf(day);
  const date = addDays(weekStart, dayIndex);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return days[dayIndex];
};

const buildDateTime = (weekStart: Date, day: Day, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = addDays(weekStart, days.indexOf(day));
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatFullDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);

const formatHolidayRange = (holiday: Holiday) => {
  const startDate = parseDateInput(holiday.startDate);
  const endDate = parseDateInput(holiday.endDate);
  const startLabel = formatFullDate(startDate);
  const endLabel = formatFullDate(endDate);
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

const getPrimaryRole = (staffId: string, weekAssignments: Assignment[]) => {
  const staffAssignments = weekAssignments.filter(
    (assignment) => assignment.staffId === staffId
  );
  if (staffAssignments.length === 0) return "";
  staffAssignments.sort(
    (a, b) => days.indexOf(a.day) - days.indexOf(b.day)
  );
  return staffAssignments[0].role;
};

export default function RotaPage() {
  const router = useRouter();
  const { isManager, loading } = useUserRole();
  const { currentRestaurantId } = useRestaurant();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<Day | "All">("All");
  const [sortMode, setSortMode] = useState<"name" | "role">("name");
  const [onlyScheduled, setOnlyScheduled] = useState(false);

  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [addShiftStaffId, setAddShiftStaffId] = useState(
    ""
  );
  const [addShiftDay, setAddShiftDay] = useState<Day>("Mon");
  const [addShiftRole, setAddShiftRole] = useState(roleOptions[0]);
  const [addShiftStart, setAddShiftStart] = useState("11:30");
  const [addShiftEnd, setAddShiftEnd] = useState("19:00");

  const [addHolidayOpen, setAddHolidayOpen] = useState(false);
  const [addHolidayStaffId, setAddHolidayStaffId] = useState("");
  const [addHolidayStart, setAddHolidayStart] = useState(
    formatDateInput(getWeekStart(new Date()))
  );
  const [addHolidayEnd, setAddHolidayEnd] = useState(
    formatDateInput(getWeekStart(new Date()))
  );
  const [addHolidayReason, setAddHolidayReason] = useState("");
  const [holidayError, setHolidayError] = useState<string | null>(null);

  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addStaffName, setAddStaffName] = useState("");
  const [addStaffUserId, setAddStaffUserId] = useState<string>("");
  const [removeStaffOpen, setRemoveStaffOpen] = useState(false);
  const [removeStaffId, setRemoveStaffId] = useState<string | null>(null);
  const [removeStaffName, setRemoveStaffName] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeStaffId, setActiveStaffId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<Day>("Mon");
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(
    null
  );
  const [role, setRole] = useState(roleOptions[0]);
  const [startTime, setStartTime] = useState("11:30");
  const [endTime, setEndTime] = useState("19:00");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [staffMenuOpenId, setStaffMenuOpenId] = useState<string | null>(
    null
  );

  const weekKey = useMemo(() => formatWeekKey(weekStart), [weekStart]);
  const todayLabel = useMemo(() => {
    const now = new Date();
    const currentWeekKey = formatWeekKey(getWeekStart(now));
    if (currentWeekKey !== weekKey) return null;
    const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
    return days[dayIndex];
  }, [weekKey]);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, Assignment>();
    assignments.forEach((assignment) => {
      map.set(`${assignment.staffId}-${assignment.day}`, assignment);
    });
    return map;
  }, [assignments]);

  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday>();
    holidays.forEach((holiday) => {
      const startDate = parseDateInput(holiday.startDate);
      const endDate = parseDateInput(holiday.endDate);
      days.forEach((day) => {
        const date = addDays(weekStart, days.indexOf(day));
        if (isDateInRange(date, startDate, endDate)) {
          map.set(`${holiday.staffId}-${day}`, holiday);
        }
      });
    });
    return map;
  }, [holidays, weekStart]);

  const staffById = useMemo(() => {
    return new Map(staff.map((person) => [person.id, person]));
  }, [staff]);

  const visibleDays = selectedDay === "All" ? days : [selectedDay];

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadStaff = useCallback(async () => {
    const { data, error } = await supabase
      .from("staff")
      .select("id, name, user_id, role")
      .eq("restaurant_id", currentRestaurantId)
      .order("name");

    if (error || !data) return;
    setStaff(
      data.map((row) => ({
        id: row.id,
        name: row.name,
        userId: row.user_id ?? null,
        role: row.role ?? null,
      }))
    );
  }, [currentRestaurantId]);

  const loadProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from("restaurant_members")
      .select("user_id, profile:profiles ( id, email )")
      .eq("restaurant_id", currentRestaurantId)
      .order("created_at");

    if (error || !data) return;
    setProfiles(
      data
        .map((row) => ({
          id: row.profile?.id ?? row.user_id,
          email: row.profile?.email ?? null,
        }))
        .filter((row) => Boolean(row.id))
    );
  }, [currentRestaurantId]);

  const loadShifts = useCallback(async () => {
    const rangeStart = new Date(weekStart);
    const rangeEnd = addDays(weekStart, 7);
    const { data, error } = await supabase
      .from("shifts")
      .select("id, staff_id, start_time, end_time, role")
      .eq("restaurant_id", currentRestaurantId)
      .gte("start_time", rangeStart.toISOString())
      .lt("start_time", rangeEnd.toISOString())
      .order("start_time");

    if (error || !data) return;

    setAssignments(
      data.map((row) => {
        const startDate = new Date(row.start_time);
        const endDate = new Date(row.end_time);
        return {
          id: row.id,
          staffId: row.staff_id,
          day: getDayFromDate(startDate),
          role: row.role,
          startTime: formatTime(startDate),
          endTime: formatTime(endDate),
        } as Assignment;
      })
    );
  }, [currentRestaurantId, weekStart]);

  const loadHolidays = useCallback(async () => {
    const rangeStart = formatDateInput(weekStart);
    const rangeEnd = formatDateInput(addDays(weekStart, 6));
    const { data, error } = await supabase
      .from("holidays")
      .select("id, staff_id, start_date, end_date, reason, created_by")
      .eq("restaurant_id", currentRestaurantId)
      .lte("start_date", rangeEnd)
      .gte("end_date", rangeStart)
      .order("start_date");

    if (error || !data) return;
    setHolidays(
      data.map((row) => ({
        id: row.id,
        staffId: row.staff_id,
        startDate: row.start_date,
        endDate: row.end_date,
        reason: row.reason ?? null,
        createdBy: row.created_by ?? null,
      }))
    );
  }, [currentRestaurantId, weekStart]);

  useEffect(() => {
    if (!currentRestaurantId) return;
    void loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    if (!currentRestaurantId) return;
    void loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (!currentRestaurantId) return;
    void loadShifts();
  }, [loadShifts]);

  useEffect(() => {
    if (!currentRestaurantId) return;
    void loadHolidays();
  }, [loadHolidays]);

  useEffect(() => {
    if (!staffMenuOpenId) return;
    const handleClick = () => setStaffMenuOpenId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [staffMenuOpenId]);

  const displayedStaff = useMemo(() => {
    const list = onlyScheduled
      ? staff.filter((person) =>
          assignments.some((assignment) => assignment.staffId === person.id)
        )
      : staff;

    const withRole = list.map((person) => {
      const role = getPrimaryRole(person.id, assignments);
      return { person, role };
    });

    withRole.sort((a, b) => {
      if (sortMode === "role") {
        const roleCompare = a.role.localeCompare(b.role);
        if (roleCompare !== 0) return roleCompare;
      }
      return a.person.name.localeCompare(b.person.name);
    });

    return withRole.map((item) => item.person);
  }, [assignments, onlyScheduled, sortMode, staff]);

  useEffect(() => {
    if (!loading && !isManager) {
      router.replace("/app/my-rota");
    }
  }, [isManager, loading, router]);

  if (!isManager) {
    return null;
  }

  if (!currentRestaurantId && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Select a restaurant to manage the rota.
      </div>
    );
  }

  const openAddShift = () => {
    const eligible = staff.filter((person) => person.role !== "manager");
    setAddShiftStaffId(eligible[0]?.id ?? "");
    setAddShiftDay("Mon");
    setAddShiftRole(roleOptions[0]);
    setAddShiftStart("11:30");
    setAddShiftEnd("19:00");
    setTimeError(null);
    setAddShiftOpen(true);
  };

  const closeAddShift = () => {
    setAddShiftOpen(false);
  };

  const handleAddShift = async () => {
    if (!currentRestaurantId) return;
    if (!addShiftStaffId) return;
    if (holidayMap.has(`${addShiftStaffId}-${addShiftDay}`)) {
      setTimeError("Staff member is on holiday.");
      setToast("Staff member is on holiday");
      return;
    }
    if (!isValidTimeRange(addShiftStart, addShiftEnd)) {
      setTimeError("End time must be after start time.");
      setToast("Invalid time range");
      return;
    }
    const staffMember = staffById.get(addShiftStaffId);
    if (staffMember?.role === "manager") return;
    const startDate = buildDateTime(weekStart, addShiftDay, addShiftStart);
    const endDate = buildDateTime(weekStart, addShiftDay, addShiftEnd);
    const userId = staffMember?.userId ?? null;
    setSaving(true);
    const { error } = await supabase.from("shifts").insert({
      restaurant_id: currentRestaurantId,
      staff_id: addShiftStaffId,
      user_id: userId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      role: addShiftRole,
    });
    setSaving(false);
    if (error) return;
    await loadShifts();
    setToast("Shift created");
    setAddShiftOpen(false);
  };

  const openAddHoliday = (staffId?: string, day?: Day) => {
    const eligible = staff.filter((person) => person.role !== "manager");
    const resolvedStaffId = staffId ?? eligible[0]?.id ?? "";
    const resolvedDay = day ?? "Mon";
    const startDate = formatDateInput(
      addDays(weekStart, days.indexOf(resolvedDay))
    );
    setAddHolidayStaffId(resolvedStaffId);
    setAddHolidayStart(startDate);
    setAddHolidayEnd(startDate);
    setAddHolidayReason("");
    setHolidayError(null);
    setAddHolidayOpen(true);
  };

  const closeAddHoliday = () => {
    setAddHolidayOpen(false);
    setHolidayError(null);
  };

  const openAddStaff = () => {
    setAddStaffName("");
    setAddStaffUserId("");
    setAddStaffOpen(true);
  };

  const closeAddStaff = () => {
    setAddStaffOpen(false);
  };

  const handleAddStaff = async () => {
    if (!currentRestaurantId) return;
    if (!addStaffName.trim()) return;
    const { error } = await supabase
      .from("staff")
      .insert({
        restaurant_id: currentRestaurantId,
        name: addStaffName.trim(),
        user_id: addStaffUserId || null,
      });
    if (error) return;
    await loadStaff();
    setAddStaffOpen(false);
  };

  const openRemoveStaff = (person: Staff) => {
    setRemoveStaffId(person.id);
    setRemoveStaffName(person.name);
    setRemoveStaffOpen(true);
  };

  const closeRemoveStaff = () => {
    setRemoveStaffOpen(false);
    setRemoveStaffId(null);
    setRemoveStaffName("");
  };

  const handleRemoveStaff = async () => {
    if (!removeStaffId) return;
    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", removeStaffId);
    if (error) return;
    await loadStaff();
    await loadShifts();
    closeRemoveStaff();
  };
  const openModal = (staffId: string, day: Day) => {
    const assignment = assignmentMap.get(`${staffId}-${day}`);
    setActiveStaffId(staffId);
    setActiveDay(day);
    setActiveAssignmentId(assignment?.id ?? null);
    setRole(assignment?.role ?? roleOptions[0]);
    setStartTime(assignment?.startTime ?? "11:30");
    setEndTime(assignment?.endTime ?? "19:00");
    setTimeError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!currentRestaurantId) return;
    if (!activeStaffId) return;
    if (holidayMap.has(`${activeStaffId}-${activeDay}`)) {
      setToast("Staff member is on holiday");
      return;
    }
    if (!isValidTimeRange(startTime, endTime)) {
      setTimeError("End time must be after start time.");
      setToast("Invalid time range");
      return;
    }
    const startDate = buildDateTime(weekStart, activeDay, startTime);
    const endDate = buildDateTime(weekStart, activeDay, endTime);
    const userId = staffById.get(activeStaffId)?.userId ?? null;
    setSaving(true);
    if (activeAssignmentId) {
      const { error } = await supabase
        .from("shifts")
        .update({
          staff_id: activeStaffId,
          user_id: userId,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          role,
        })
        .eq("id", activeAssignmentId);
      setSaving(false);
      if (error) return;
    } else {
      const { error } = await supabase.from("shifts").insert({
        restaurant_id: currentRestaurantId,
        staff_id: activeStaffId,
        user_id: userId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        role,
      });
      setSaving(false);
      if (error) return;
    }
    await loadShifts();
    setToast("Shift updated");
    setModalOpen(false);
  };

  const handleSaveHoliday = async () => {
    if (!currentRestaurantId) return;
    if (!addHolidayStaffId) return;
    const startDate = parseDateInput(addHolidayStart);
    const endDate = parseDateInput(addHolidayEnd);
    if (endDate.getTime() < startDate.getTime()) {
      setHolidayError("End date must be on or after the start date.");
      setToast("Invalid holiday range");
      return;
    }
    setHolidayError(null);

    setSaving(true);
    const { data: existing, error: existingError } = await supabase
      .from("holidays")
      .select("id")
      .eq("staff_id", addHolidayStaffId)
      .eq("restaurant_id", currentRestaurantId)
      .lte("start_date", addHolidayEnd)
      .gte("end_date", addHolidayStart);

    if (existingError) {
      setSaving(false);
      setHolidayError(existingError.message);
      return;
    }

    if (existing && existing.length > 0) {
      setSaving(false);
      setHolidayError("This holiday overlaps an existing entry.");
      setToast("Holiday overlaps an existing entry");
      return;
    }

    const rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = addDays(endDate, 1);
    rangeEnd.setHours(0, 0, 0, 0);

    const { data: shiftsInRange } = await supabase
      .from("shifts")
      .select("id")
      .eq("staff_id", addHolidayStaffId)
      .eq("restaurant_id", currentRestaurantId)
      .gte("start_time", rangeStart.toISOString())
      .lt("start_time", rangeEnd.toISOString());

    if (shiftsInRange && shiftsInRange.length > 0) {
      const confirmRemove = window.confirm(
        `This holiday overlaps ${shiftsInRange.length} shift${
          shiftsInRange.length === 1 ? "" : "s"
        }. Remove them?`
      );
      if (!confirmRemove) {
        setSaving(false);
        return;
      }
      const shiftIds = shiftsInRange.map((row) => row.id);
      await supabase.from("shifts").delete().in("id", shiftIds);
    }

    const { data: authData } = await supabase.auth.getUser();
    const createdBy = authData.user?.id ?? null;

    const { error } = await supabase.from("holidays").insert({
      restaurant_id: currentRestaurantId,
      staff_id: addHolidayStaffId,
      start_date: addHolidayStart,
      end_date: addHolidayEnd,
      reason: addHolidayReason.trim() || null,
      created_by: createdBy,
    });
    setSaving(false);
    if (error) {
      setHolidayError(error.message);
      return;
    }
    await loadHolidays();
    await loadShifts();
    setToast("Holiday saved");
    setAddHolidayOpen(false);
  };

  const handleClear = async () => {
    if (!activeAssignmentId) return;
    setSaving(true);
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", activeAssignmentId);
    setSaving(false);
    if (error) return;
    await loadShifts();
    setToast("Shift updated");
    setModalOpen(false);
  };

  const handleDragStart = (
    event: React.DragEvent,
    assignmentId: string
  ) => {
    event.dataTransfer.setData("text/plain", assignmentId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (
    event: React.DragEvent,
    staffId: string,
    day: Day
  ) => {
    event.preventDefault();
    const assignmentId = event.dataTransfer.getData("text/plain");
    if (!assignmentId) return;
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment) return;
    const startDate = buildDateTime(weekStart, day, assignment.startTime);
    const endDate = buildDateTime(weekStart, day, assignment.endTime);
    const userId = staffById.get(staffId)?.userId ?? null;
    const { error } = await supabase
      .from("shifts")
      .update({
        staff_id: staffId,
        user_id: userId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      })
      .eq("id", assignmentId);
    if (error) return;
    await loadShifts();
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 32;
    const marginTop = 32;
    const marginBottom = 32;
    const tableWidth = pageWidth - marginX * 2;
    const staffColWidth = 140;
    const dayColWidth =
      visibleDays.length > 0
        ? (tableWidth - staffColWidth) / visibleDays.length
        : 0;
    const headerHeight = 22;
    const rowHeight = 20;
    const headerY = marginTop + 44;
    const availableHeight = pageHeight - marginBottom - headerY;
    const rowsPerPage = Math.max(
      1,
      Math.floor((availableHeight - headerHeight) / rowHeight)
    );

    const weekRange = `Week of ${formatFullDate(
      weekStart
    )} – ${formatFullDate(addDays(weekStart, 6))}`;
    const generatedAt = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());

    const drawHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Weekline", marginX, marginTop);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(weekRange, marginX, marginTop + 16);
      doc.text(`Generated ${generatedAt}`, pageWidth - marginX, marginTop + 16, {
        align: "right",
      });
    };

    const drawTableHeader = (y: number) => {
      doc.setFillColor(245, 246, 248);
      doc.rect(marginX, y, tableWidth, headerHeight, "F");
      doc.setDrawColor(200, 200, 200);
      doc.rect(marginX, y, tableWidth, headerHeight, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text("Staff", marginX + 6, y + 14);
      visibleDays.forEach((day, index) => {
        const x = marginX + staffColWidth + index * dayColWidth;
        const label = `${day} ${formatDayDate(weekStart, day)}`;
        doc.text(label, x + 6, y + 14);
      });
    };

    const totalPages = Math.ceil(displayedStaff.length / rowsPerPage);

    for (let page = 0; page < totalPages; page += 1) {
      if (page > 0) doc.addPage();
      drawHeader();
      drawTableHeader(headerY);

      const startIndex = page * rowsPerPage;
      const endIndex = Math.min(
        displayedStaff.length,
        startIndex + rowsPerPage
      );
      let y = headerY + headerHeight;

      for (let i = startIndex; i < endIndex; i += 1) {
        const person = displayedStaff[i];
        doc.setDrawColor(220, 220, 220);
        doc.rect(marginX, y, tableWidth, rowHeight, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text(person.name, marginX + 6, y + 13);

        visibleDays.forEach((day, dayIndex) => {
          const x = marginX + staffColWidth + dayIndex * dayColWidth;
          doc.rect(x, y, dayColWidth, rowHeight, "S");
          const assignment = assignmentMap.get(`${person.id}-${day}`);
          const holiday = holidayMap.get(`${person.id}-${day}`);
          const text = holiday
            ? "Holiday"
            : assignment
            ? `${assignment.role} ${assignment.startTime}–${assignment.endTime}`
            : "Off";
          doc.setFont("helvetica", assignment ? "bold" : "normal");
          doc.setTextColor(30, 30, 30);
          doc.text(text, x + 6, y + 13);
        });

        y += rowHeight;
      }
    }

    doc.save(`rota-${weekKey}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Weekly rota
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Staff × days assignments
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="text-gray-500">Role legend:</span>
            {roleOptions.map((roleOption) => (
              <span
                key={roleOption}
                className={`rounded border px-2 py-0.5 font-medium ${roleStyles[roleOption].legend}`}
              >
                {roleOption}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAddShift}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
          >
            + Add shift
          </button>
          <button
            type="button"
            onClick={() => openAddHoliday()}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            + Add holiday
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-md border border-gray-200 bg-white text-xs text-gray-600">
          {(["All", ...days] as const).map((dayOption) => (
            <button
              key={dayOption}
              type="button"
              onClick={() => setSelectedDay(dayOption as Day | "All")}
              className={`px-3 py-1.5 ${
                selectedDay === dayOption
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {dayOption}
            </button>
          ))}
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
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <label className="flex items-center gap-2">
            <span>Sort</span>
            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as "name" | "role")
              }
              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
            >
              <option value="name">Name (A–Z)</option>
              <option value="role">Role</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyScheduled}
              onChange={(event) => setOnlyScheduled(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
            />
            Only scheduled
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-gray-50">
              <tr>
                <th className="sticky left-0 z-30 w-44 border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  <div className="flex flex-col gap-2">
                    <span>Staff</span>
                    <button
                      type="button"
                      onClick={openAddStaff}
                      className="w-fit rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:border-gray-300 hover:text-gray-700"
                    >
                      + Add staff
                    </button>
                  </div>
                </th>
                {visibleDays.map((day) => (
                  <th
                    key={day}
                    className={`border-b border-gray-200 px-3 py-2 text-center text-xs font-semibold ${
                      day === todayLabel
                        ? "bg-blue-50/80 text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold ${
                        day === todayLabel
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {day}
                    </div>
                    <div
                      className={`text-[11px] font-normal ${
                        day === todayLabel
                          ? "text-blue-700/70"
                          : "text-gray-500"
                      }`}
                    >
                      {formatDayDate(weekStart, day)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedStaff.map((person) => (
                <tr key={person.id} className="even:bg-gray-50/40">
                  <td
                    className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800"
                    onDoubleClick={() => openRemoveStaff(person)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setStaffMenuOpenId(person.id);
                    }}
                  >
                    <div className="relative flex items-center justify-between gap-2">
                      <span>{person.name}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setStaffMenuOpenId((prev) =>
                            prev === person.id ? null : person.id
                          );
                        }}
                        className="rounded px-1 text-gray-400 hover:text-gray-600"
                        aria-label={`Staff actions for ${person.name}`}
                      >
                        ⋯
                      </button>
                      {staffMenuOpenId === person.id ? (
                        <div className="absolute right-0 top-6 z-20 w-40 rounded-md border border-gray-200 bg-white p-1 text-xs text-gray-700 shadow-lg">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setStaffMenuOpenId(null);
                              openAddHoliday(person.id);
                            }}
                            className="w-full rounded px-2 py-1.5 text-left hover:bg-gray-50"
                          >
                            Add holiday
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  {visibleDays.map((day) => {
                    const assignment = assignmentMap.get(
                      `${person.id}-${day}`
                    );
                    const holiday = holidayMap.get(`${person.id}-${day}`);
                    const holidayLabel = holiday
                      ? `${formatHolidayRange(holiday)}${holiday.reason ? ` · ${holiday.reason}` : ""}`
                      : "";
                    return (
                      <td
                        key={`${person.id}-${day}`}
                        onClick={() => {
                          if (holiday) {
                            setToast("Staff member is on holiday");
                            return;
                          }
                          openModal(person.id, day);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = holiday
                            ? "none"
                            : "move";
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (holiday) {
                            setToast("Staff member is on holiday");
                            return;
                          }
                          handleDrop(event, person.id, day);
                        }}
                        title={
                          holiday
                            ? `Staff member is on holiday · ${holidayLabel}`
                            : undefined
                        }
                        className={`h-10 border-b border-gray-200 px-2 py-1 text-left align-middle hover:bg-blue-50/40 ${
                          day === todayLabel ? "bg-blue-50/30" : ""
                        }`}
                      >
                        {holiday ? (
                          <div className="inline-flex items-center rounded-md bg-amber-50/70 px-2 py-1 text-[11px] font-medium text-amber-700">
                            Holiday
                          </div>
                        ) : assignment ? (
                          <div
                            className={`inline-flex items-center gap-2 rounded border border-l-4 px-2 py-1 text-[11px] font-medium shadow-sm cursor-pointer ${roleStyles[assignment.role]?.pill ?? "border-gray-200 bg-white text-gray-800"}`}
                            draggable
                            onDragStart={(event) =>
                              handleDragStart(event, assignment.id)
                            }
                            role="button"
                            tabIndex={0}
                          >
                            <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                              {assignment.role}
                            </span>
                            <span>
                              {assignment.startTime}–{assignment.endTime}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            Off
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div
            className={`w-full max-w-sm rounded-lg bg-white p-5 shadow-lg ${saving ? "opacity-80" : ""}`}
          >
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Edit assignment
              </h2>
              <p className="text-xs text-gray-500">
                {activeDay} ·{" "}
                {staff.find((person) => person.id === activeStaffId)?.name ??
                  "Staff"}
              </p>
            </div>
            <div className="space-y-4">
              <div>
              <label className="text-xs font-medium text-gray-600">
                Role
              </label>
              <select
                value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {roleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Start
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    End
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              {timeError ? (
                <p className="text-xs text-red-600">{timeError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Clear day
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {addShiftOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div
            className={`w-full max-w-sm rounded-lg bg-white p-5 shadow-lg ${saving ? "opacity-80" : ""}`}
          >
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Add shift
              </h2>
              <p className="text-xs text-gray-500">
                Create a new assignment.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Staff member
                </label>
              <select
                value={addShiftStaffId}
                onChange={(event) => setAddShiftStaffId(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {staff
                  .filter((person) => person.role !== "manager")
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Day
                  </label>
                  <select
                    value={addShiftDay}
                    onChange={(event) =>
                      setAddShiftDay(event.target.value as Day)
                    }
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {days.map((dayOption) => (
                      <option key={dayOption} value={dayOption}>
                        {dayOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Role
                  </label>
                  <select
                    value={addShiftRole}
                    onChange={(event) => setAddShiftRole(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {roleOptions.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Start
                  </label>
                  <input
                    type="time"
                    value={addShiftStart}
                    onChange={(event) => setAddShiftStart(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    End
                  </label>
                  <input
                    type="time"
                    value={addShiftEnd}
                    onChange={(event) => setAddShiftEnd(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              {timeError ? (
                <p className="text-xs text-red-600">{timeError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeAddShift}
                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddShift}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {addHolidayOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div
            className={`w-full max-w-sm rounded-lg bg-white p-5 shadow-lg ${saving ? "opacity-80" : ""}`}
          >
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Add holiday
              </h2>
              <p className="text-xs text-gray-500">
                Block time away from shifts.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Staff member
                </label>
                <select
                  value={addHolidayStaffId}
                  onChange={(event) =>
                    setAddHolidayStaffId(event.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {staff
                    .filter((person) => person.role !== "manager")
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={addHolidayStart}
                    onChange={(event) => setAddHolidayStart(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    End date
                  </label>
                  <input
                    type="date"
                    value={addHolidayEnd}
                    onChange={(event) => setAddHolidayEnd(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Optional note
                </label>
                <textarea
                  value={addHolidayReason}
                  onChange={(event) =>
                    setAddHolidayReason(event.target.value)
                  }
                  rows={3}
                  className="mt-1 w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {holidayError ? (
                <p className="text-xs text-red-600">{holidayError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeAddHoliday}
                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHoliday}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
              >
                Save holiday
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {addStaffOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Add staff
              </h2>
              <p className="text-xs text-gray-500">
                Create a new staff row.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Staff name
              </label>
              <input
                value={addStaffName}
                onChange={(event) => setAddStaffName(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600">
                Link user (optional)
              </label>
              <select
                value={addStaffUserId}
                onChange={(event) => setAddStaffUserId(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">No linked user</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.email ?? profile.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeAddStaff}
                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddStaff}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {removeStaffOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Remove staff
              </h2>
              <p className="text-xs text-gray-500">
                This will delete {removeStaffName} and their shifts.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeRemoveStaff}
                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveStaff}
                className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
