
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const handleYearChange = (value: string) => {
    if (props.onMonthChange) {
      const newMonth = new Date(props.month || new Date());
      newMonth.setFullYear(parseInt(value, 10));
      props.onMonthChange(newMonth);
    }
  };

  const handleMonthChange = (value: string) => {
    if (props.onMonthChange) {
      const newMonth = new Date(props.month || new Date());
      newMonth.setMonth(parseInt(value, 10));
      props.onMonthChange(newMonth);
    }
  };


  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex justify-center gap-2",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
        Dropdown: (dropdownProps) => {
            const { fromYear, fromMonth, fromDate, toYear, toMonth, toDate } =
              props;
  
            const from = fromDate || (fromMonth && fromYear && new Date(fromYear, fromMonth.getMonth())) || (fromYear && new Date(fromYear, 0));
            const to = toDate || (toMonth && toYear && new Date(toYear, toMonth.getMonth() + 1, 0)) || (toYear && new Date(toYear, 11));

            if (dropdownProps.name === "months") {
              const months = Array.from({ length: 12 }, (_, i) => new Date(2024, i, 1));
              return (
                <Select
                  value={String(props.month?.getMonth() ?? new Date().getMonth())}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger>{new Date(2024, props.month?.getMonth() ?? new Date().getMonth()).toLocaleString('default', { month: 'long' })}</SelectTrigger>
                  <SelectContent>
                    {months.map((month, i) => {
                       const isEnabled = 
                       (!from || new Date(props.month?.getFullYear() ?? new Date().getFullYear(), i) >= new Date(from.getFullYear(), from.getMonth())) && 
                       (!to || new Date(props.month?.getFullYear() ?? new Date().getFullYear(), i) <= new Date(to.getFullYear(), to.getMonth()));
                       return (
                          <SelectItem key={i} value={String(i)} disabled={!isEnabled}>
                            {month.toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                       )
                    })}
                  </SelectContent>
                </Select>
              );
            }
  
            if (dropdownProps.name === "years") {
              const years: number[] = [];
              for (let i = fromYear || 1900; i <= (toYear || new Date().getFullYear()); i++) {
                years.push(i);
              }
              return (
                <Select
                  value={String(props.month?.getFullYear() ?? new Date().getFullYear())}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger>{props.month?.getFullYear() ?? new Date().getFullYear()}</SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }
  
            return null;
          }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
