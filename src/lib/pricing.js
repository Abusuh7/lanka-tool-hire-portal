/**
 * Hire cost calculation shared by /api/quote and /api/rentals so the price a
 * customer is charged is always computed server-side from the tool's rates.
 */
export function calculateCost(hourlyRate, dailyRate, weeklyRate, start, end) {
  const msPerHour = 1000 * 60 * 60;
  const totalHours = Math.ceil((end - start) / msPerHour);

  if (totalHours <= 0) {
    throw new Error('End time must be after start time');
  }

  const hoursPerDay = 24;
  const hoursPerWeek = 24 * 7;

  // Best tier rates (ensure customer always gets the lowest rate per tier)
  const effectiveDailyRate = Math.min(dailyRate, hoursPerDay * hourlyRate);
  const effectiveWeeklyRate = Math.min(weeklyRate, 7 * effectiveDailyRate);

  const weeks = Math.floor(totalHours / hoursPerWeek);
  const remainingHoursAfterWeeks = totalHours % hoursPerWeek;

  const days = Math.floor(remainingHoursAfterWeeks / hoursPerDay);
  const remainingHours = remainingHoursAfterWeeks % hoursPerDay;

  // Remainder hours cost capped at the daily rate
  const remainingHoursCost = Math.min(remainingHours * hourlyRate, effectiveDailyRate);

  // Total remainder days + hours cost capped at the weekly rate
  const remainderCost = Math.min(days * effectiveDailyRate + remainingHoursCost, effectiveWeeklyRate);

  return weeks * effectiveWeeklyRate + remainderCost;
}

/** Parses a date input, returning null when it is missing or invalid. */
export function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function calculateToolCost(tool, start, end) {
  return calculateCost(
    Number(tool.hourlyRate),
    Number(tool.dailyRate),
    Number(tool.weeklyRate),
    start,
    end
  );
}
