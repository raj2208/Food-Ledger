"use client";

import { format } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dateToString, stringToDate } from "@/lib/profile";

type Props = {
  id: string;
  name: string; // the form field that receives "YYYY-MM-DD" (or "" when cleared)
  defaultValue?: string | null;
  min: string; // earliest selectable day, "YYYY-MM-DD"
  max: string; // latest selectable day, "YYYY-MM-DD"
};

// shadcn date picker (Popover + Calendar). A hidden input carries the value into the form.
export function DatePicker({ id, name, defaultValue, min, max }: Props) {
  const [date, setDate] = useState<Date | undefined>(() => stringToDate(defaultValue));
  const [open, setOpen] = useState(false);
  const earliest = stringToDate(min);
  const latest = stringToDate(max);

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={date ? dateToString(date) : ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className="flex-1 justify-start font-normal data-[empty=true]:text-muted-foreground"
              data-empty={!date}
            />
          }
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? format(date, "PPP") : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            defaultMonth={date ?? latest}
            captionLayout="dropdown"
            startMonth={earliest}
            endMonth={latest}
            disabled={[{ before: earliest ?? new Date(1900, 0, 1) }, { after: latest ?? new Date() }]}
          />
        </PopoverContent>
      </Popover>
      {date ? (
        <Button type="button" variant="ghost" size="icon" aria-label="Clear date" onClick={() => setDate(undefined)}>
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}
