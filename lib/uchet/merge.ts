import type {
  AttendanceDay,
  MonthHoursMap,
  Order,
  UchetState,
  Worker,
} from "./types";

function uniqStrings(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

function mergeById<T extends { id: string }>(
  remote: T[],
  incoming: T[],
  removedIds: Set<string>
): T[] {
  const map = new Map<string, T>();
  for (const item of remote) {
    if (!removedIds.has(item.id)) map.set(item.id, item);
  }
  for (const item of incoming) {
    if (removedIds.has(item.id)) {
      map.delete(item.id);
      continue;
    }
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

function attendanceKey(day: AttendanceDay): string {
  return `${day.workerId}|${day.date}`;
}

function mergeAttendance(
  remote: AttendanceDay[],
  incoming: AttendanceDay[]
): AttendanceDay[] {
  const map = new Map<string, AttendanceDay>();
  for (const day of remote) map.set(attendanceKey(day), day);
  for (const day of incoming) map.set(attendanceKey(day), day);
  return Array.from(map.values());
}

function mergeMonthHours(
  remote: MonthHoursMap,
  incoming: MonthHoursMap
): MonthHoursMap {
  return { ...(remote ?? {}), ...(incoming ?? {}) };
}

/**
 * Merge cloud + device state so phones don't wipe each other's orders.
 * Deletions are tracked via removed* id lists.
 */
export function mergeUchetStates(
  remote: UchetState | null,
  incoming: UchetState
): UchetState {
  if (!remote) {
    return {
      ...incoming,
      monthHours: incoming.monthHours ?? {},
      removedOrderIds: uniqStrings(incoming.removedOrderIds ?? []),
      removedWorkerIds: uniqStrings(incoming.removedWorkerIds ?? []),
    };
  }

  const removedOrderIds = new Set(
    uniqStrings([
      ...(remote.removedOrderIds ?? []),
      ...(incoming.removedOrderIds ?? []),
    ])
  );
  const removedWorkerIds = new Set(
    uniqStrings([
      ...(remote.removedWorkerIds ?? []),
      ...(incoming.removedWorkerIds ?? []),
    ])
  );

  const workers = mergeById(
    remote.workers,
    incoming.workers,
    removedWorkerIds
  ).filter((w) => !removedWorkerIds.has(w.id));

  const orders = mergeById(
    remote.orders,
    incoming.orders,
    removedOrderIds
  ).filter(
    (o) => !removedOrderIds.has(o.id) && !removedWorkerIds.has(o.workerId)
  );

  const attendance = mergeAttendance(
    remote.attendance,
    incoming.attendance
  ).filter((a) => !removedWorkerIds.has(a.workerId));

  const monthHoursRaw = mergeMonthHours(
    remote.monthHours ?? {},
    incoming.monthHours ?? {}
  );
  const monthHours: MonthHoursMap = {};
  for (const [key, value] of Object.entries(monthHoursRaw)) {
    const workerId = key.split(":")[0];
    if (removedWorkerIds.has(workerId)) continue;
    monthHours[key] = value;
  }

  const selectedWorkerId =
    workers.find((w) => w.id === incoming.selectedWorkerId)?.id ??
    workers.find((w) => w.id === remote.selectedWorkerId)?.id ??
    workers[0]?.id ??
    null;

  return {
    version: 3,
    rates: incoming.rates ?? remote.rates,
    workers,
    orders,
    attendance,
    monthHours,
    removedOrderIds: Array.from(removedOrderIds),
    removedWorkerIds: Array.from(removedWorkerIds),
    selectedWorkerId,
    selectedMonthKey: incoming.selectedMonthKey || remote.selectedMonthKey,
  };
}
