"use client";

import { BUSINESS_TIME_ZONE } from "@/i18n/i18n.config";
import {
  calendarFns,
  formatMonthHeading,
  weekdayLabels,
  weekStartsOn,
} from "@/i18n/i18n.util.calendar";
import { Button } from "@/ui/atoms";
import { TZDate } from '@date-fns/tz';
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { format as formatGregorian } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type CalendarProps = {
  selectedDates: Date[];
  onSelectDates: (dates: Date[]) => void;
  minSelectableDate?: Date;
  disabledDates?: Date[];
  onViewMonthChange?: (daysInMonth: Date[]) => void;
};

/** Identity key for a day. Always Gregorian — internal, never displayed. */
const key = (date: Date) => formatGregorian(date, "yyyy-MM-dd");

/**
 * Month picker, drawn in the reader's own calendar.
 *
 * Under `fa` this is a Jalali grid opening on Saturday; under any other locale
 * it is a Gregorian grid opening on Sunday. The month arithmetic has to come
 * from the matching date-fns build — `startOfMonth` genuinely differs between
 * the two — while the labels come from `Intl`, which picks the calendar from
 * the locale on its own.
 */
export function Calendar({
  selectedDates,
  onSelectDates,
  minSelectableDate,
  disabledDates = [],
  onViewMonthChange,
}: CalendarProps) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const { startOfDay, startOfMonth, addDays, addMonths, eachDayOfInterval, isBefore } =
    calendarFns(locale);

  const now = TZDate.tz(BUSINESS_TIME_ZONE, new Date());
  const today: Date = startOfDay(now);
  const minDate: Date = minSelectableDate
    ? startOfDay(minSelectableDate)
    : today;
  const [viewMonth, setViewMonth] = useState<Date>(today);

  const dayNumber = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        timeZone: BUSINESS_TIME_ZONE,
      }),
    [locale],
  );

  const daysInMonth: Date[] = useMemo(() => {
    const first = startOfMonth(viewMonth);
    // `getDay()` is 0=Sunday, so this is the column `first` falls in for a week
    // opening on `weekStartsOn`. The `% 7` matters: without it a month whose
    // first day *is* the opening weekday starts the grid a week early, pushing
    // the month down and wasting the top row.
    const start = addDays(first, -((first.getDay() - weekStartsOn(locale) + 7) % 7));
    return eachDayOfInterval({ start, end: addDays(start, 41) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth, locale]);

  useEffect(() => {
    onViewMonthChange?.(daysInMonth);
  }, [daysInMonth, onViewMonthChange]);

  const disabledKeys = useMemo(
    () => new Set(disabledDates.map(key)),
    [disabledDates],
  );

  const toggleDateSelection = (date: Date) => {
    if (isBefore(date, minDate) || disabledKeys.has(key(date))) return;
    onSelectDates(
      selectedDates.some((d) => key(d) === key(date))
        ? selectedDates.filter((d) => key(d) !== key(date))
        : [...selectedDates, date]
    );
  };

  return (
    <div className="bg-white rounded-2xl w-full h-full space-y-2 lg:space-y-3">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          className="border-none"
          size="sm"
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
        >
          {/* "Previous" points toward the start of the line, which flips with
              the writing direction. */}
          <IconChevronRight className="ltr:hidden" />
          <IconChevronLeft className="rtl:hidden" />
          <span>{t("prevMonth")}</span>
        </Button>

        <h2 className="font-semibold">{formatMonthHeading(locale, viewMonth)}</h2>

        <Button
          variant="outline"
          className="border-none"
          size="sm"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
        >
          <span>{t("nextMonth")}</span>
          <IconChevronLeft className="ltr:hidden" />
          <IconChevronRight className="rtl:hidden" />
        </Button>
      </div>

      <hr />

      <div className="grid grid-cols-7 text-center font-semibold">
        {weekdayLabels(locale).map((day, column) => (
          <div key={column} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 lg:gap-3">
        {daysInMonth.map((date) => {
          const isPast: boolean = isBefore(date, minDate);
          const isDisabled: boolean = disabledKeys.has(key(date));
          const isSelected: boolean = selectedDates.some(
            (d) => key(d) === key(date),
          );

          return (
            <Button
              key={key(date)}
              variant={isSelected ? "secondary" : "ghost"}
              className="rounded-2xl"
              disabled={isPast || isDisabled}
              onClick={() => toggleDateSelection(date)}
            >
              {dayNumber.format(date)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
