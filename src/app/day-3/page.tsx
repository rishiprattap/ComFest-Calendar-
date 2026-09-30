import { getScheduleList } from "@/lib/db";
import ScheduleView from "@/components/ScheduleView";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Day 3 Schedule (17 October 2026) | COMFEST'26",
  description:
    "Official Day 3 timetable for COMFEST'26 on Saturday, 17 October 2026. Hackom Presentations, Draft 1.0, Investor Incubator, Gambit, and Grand Closing Ceremony.",
};

export default async function Day3Page() {
  const schedule = await getScheduleList({ day: 3 });

  return (
    <ScheduleView
      initialSchedule={schedule}
      defaultDay={3}
      title="Day 3 Schedule &bull; 17 October 2026"
      subtitle="Official timetable for Saturday, 17 October 2026. All timings and venues sourced directly from brochure page 27."
    />
  );
}
