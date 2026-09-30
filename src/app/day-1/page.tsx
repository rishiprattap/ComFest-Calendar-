import { getScheduleList } from "@/lib/db";
import ScheduleView from "@/components/ScheduleView";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Day 1 Schedule (15 October 2026) | COMFEST'26",
  description:
    "Official Day 1 timetable for COMFEST'26 on Thursday, 15 October 2026. Registration, Opening Ceremony, Code Baton, CF Broadway, and more.",
};

export default async function Day1Page() {
  const schedule = await getScheduleList({ day: 1 });

  return (
    <ScheduleView
      initialSchedule={schedule}
      defaultDay={1}
      title="Day 1 Schedule &bull; 15 October 2026"
      subtitle="Official timetable for Thursday, 15 October 2026. All timings and venues sourced directly from brochure page 25."
    />
  );
}
