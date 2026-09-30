import { getScheduleList } from "@/lib/db";
import ScheduleView from "@/components/ScheduleView";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Full Event Schedule | COMFEST'26",
  description:
    "Explore the complete official schedule of COMFEST'26 (15–17 October 2026). Timings, venues, and Google Calendar integration for all 35+ events.",
};

export default async function FullSchedulePage() {
  const schedule = await getScheduleList();

  return (
    <ScheduleView
      initialSchedule={schedule}
      title="Full Event Schedule"
      subtitle="Complete official timetable for COMFEST'26 across all three days and venues (Seth Anandram Jaipuria School, Kanpur)."
    />
  );
}
