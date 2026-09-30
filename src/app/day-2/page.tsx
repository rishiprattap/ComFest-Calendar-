import { getScheduleList } from "@/lib/db";
import ScheduleView from "@/components/ScheduleView";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Day 2 Schedule (16 October 2026) | COMFEST'26",
  description:
    "Official Day 2 timetable for COMFEST'26 on Friday, 16 October 2026. Robowars, Hackom, Junk's The Punk, Mechanoid, and more.",
};

export default async function Day2Page() {
  const schedule = await getScheduleList({ day: 2 });

  return (
    <ScheduleView
      initialSchedule={schedule}
      defaultDay={2}
      title="Day 2 Schedule &bull; 16 October 2026"
      subtitle="Official timetable for Friday, 16 October 2026. All timings and venues sourced directly from brochure page 26."
    />
  );
}
