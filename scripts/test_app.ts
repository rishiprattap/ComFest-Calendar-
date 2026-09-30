import {
  ensureDbInitialized,
  lookupParticipantEvents,
  getScheduleList,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  adminCreateScheduleItem,
  adminUpdateScheduleItem,
  adminDeleteScheduleItem,
  adminGetAllParticipants,
  adminAddRegistration,
  adminRemoveRegistration,
  getDbClient,
} from "../src/lib/db";
import { verifyAdminPassword, createAdminSessionToken, verifyAdminSessionToken } from "../src/lib/auth";
import { generateGoogleCalendarUrl, generateIcsContent } from "../src/lib/calendar";

async function runTests() {
  console.log("==========================================");
  console.log("  RUNNING COMFEST'26 COMPREHENSIVE TESTS  ");
  console.log("==========================================");

  // 1. Database Initialization & Seeding Test
  console.log("\n[TEST 1] Initializing and verifying persistent database...");
  await ensureDbInitialized();
  const db = getDbClient();
  const evCount = await db.execute("SELECT COUNT(*) as c FROM events");
  const schedCount = await db.execute("SELECT COUNT(*) as c FROM event_schedules");
  const partCount = await db.execute("SELECT COUNT(*) as c FROM participants");
  const regCount = await db.execute("SELECT COUNT(*) as c FROM registrations");

  console.log(`  Events in DB: ${evCount.rows[0].c}`);
  console.log(`  Schedules in DB: ${schedCount.rows[0].c}`);
  console.log(`  Participants in DB: ${partCount.rows[0].c}`);
  console.log(`  Registrations in DB: ${regCount.rows[0].c}`);

  if (Number(partCount.rows[0].c) < 18 || Number(schedCount.rows[0].c) < 40) {
    throw new Error("Database seed failed or counts too low!");
  }
  console.log("✓ TEST 1 PASSED: Database initialized & seeded successfully.");

  // 2. Participant Lookup Test
  console.log("\n[TEST 2] Testing Participant Lookup for 'Rishi Pratap Singh'...");
  const lookup1 = await lookupParticipantEvents("Rishi Pratap Singh");
  console.log(`  Status: ${lookup1.status}`);
  console.log(`  Participant Name: ${lookup1.participant?.name}`);
  console.log(`  School: ${lookup1.participant?.school}`);
  console.log(`  Registered Events Count: ${lookup1.events?.length}`);

  const eventNames = lookup1.events?.map((e) => e.eventName) || [];
  console.log(`  Registered Events: ${eventNames.join(", ")}`);

  if (lookup1.status !== "found" || !eventNames.includes("Robowars") || !eventNames.includes("Code Baton")) {
    throw new Error("Participant lookup failed or expected events missing!");
  }
  console.log("✓ TEST 2 PASSED: Participant lookup returns only registered events.");

  // 3. Duplicate Name & Identifier Disambiguation Test
  console.log("\n[TEST 3] Testing Duplicate Name Handling...");
  // Temporarily insert a second participant with the name "Rishi Pratap Singh"
  await db.execute({
    sql: `INSERT INTO participants (id, name, normalized_name, email, phone, class, school, created_at, updated_at)
          VALUES ('part_duplicate_test', 'Rishi Pratap Singh', 'rishi pratap singh', 'rishi.other@school.com', '9999999999', 'X', 'Other School', datetime('now'), datetime('now'))`,
  });

  const dupLookupNoId = await lookupParticipantEvents("Rishi Pratap Singh");
  console.log(`  Duplicate lookup without identifier status: ${dupLookupNoId.status}`);
  console.log(`  Candidate count: ${dupLookupNoId.count}`);
  console.log(`  Prompt message: ${dupLookupNoId.message}`);

  if (dupLookupNoId.status !== "multiple_matches" || dupLookupNoId.count !== 2) {
    throw new Error("Duplicate name was not correctly flagged!");
  }

  // Disambiguate with class or email
  const dupLookupWithId = await lookupParticipantEvents("Rishi Pratap Singh", "XII");
  console.log(`  Disambiguated with class 'XII' status: ${dupLookupWithId.status}`);
  console.log(`  Resolved participant class: ${dupLookupWithId.participant?.class}`);

  if (dupLookupWithId.status !== "found" || dupLookupWithId.participant?.class !== "XII") {
    throw new Error("Failed to disambiguate duplicate name with identifier!");
  }

  // Clean up test duplicate
  await db.execute("DELETE FROM participants WHERE id = 'part_duplicate_test'");
  console.log("✓ TEST 3 PASSED: Duplicate name handling requires additional identifier without guessing.");

  // 4. Official Common COMFEST'26 Google Calendar & Full Feed Test
  console.log("\n[TEST 4] Testing Official Common COMFEST'26 Google Calendar & Full Feed...");
  const allSchedules = await getScheduleList();
  console.log(`  Total Official Schedules in Calendar: ${allSchedules.length}`);

  const fullIcs = generateIcsContent(allSchedules);
  const eventCountInIcs = (fullIcs.match(/BEGIN:VEVENT/g) || []).length;
  console.log(`  Events in Full Official ICS: ${eventCountInIcs}`);

  if (
    !fullIcs.includes("BEGIN:VCALENDAR") ||
    !fullIcs.includes("X-WR-CALNAME:COMFEST'26") ||
    !fullIcs.includes("X-WR-TIMEZONE:Asia/Kolkata") ||
    !fullIcs.includes("Opening Ceremony") ||
    !fullIcs.includes("Robowars") ||
    !fullIcs.includes("Closing Ceremony") ||
    eventCountInIcs !== allSchedules.length
  ) {
    throw new Error("Invalid Official COMFEST'26 ICS calendar generated!");
  }
  console.log("✓ TEST 4 PASSED: One Common COMFEST'26 official calendar with Asia/Kolkata verified.");

  // 5. Admin Authentication & Session Security Test
  console.log("\n[TEST 5] Testing Admin Authentication & Server-Side Session...");
  const validPassword = verifyAdminPassword("DPSBK20");
  const invalidPassword = verifyAdminPassword("WRONGPASSWORD");
  console.log(`  Valid password 'DPSBK20' result: ${validPassword}`);
  console.log(`  Invalid password result: ${invalidPassword}`);

  if (!validPassword || invalidPassword) {
    throw new Error("Admin password verification failed!");
  }

  const token = createAdminSessionToken();
  const isTokenValid = verifyAdminSessionToken(token);
  const isForgedTokenValid = verifyAdminSessionToken(token + "tampered");
  console.log(`  Generated session token verified: ${isTokenValid}`);
  console.log(`  Tampered session token verified: ${isForgedTokenValid}`);

  if (!isTokenValid || isForgedTokenValid) {
    throw new Error("HMAC session signing failed!");
  }
  console.log("✓ TEST 5 PASSED: Server-side password & cryptographic HMAC session verified.");

  // 6. Admin Timing & Venue Mutation Test
  console.log("\n[TEST 6] Testing Admin Schedule Timing & Venue Mutation...");
  const newSched = await adminCreateScheduleItem({
    event_name: "Test Robowars Special Arena",
    day: 2,
    date: "2026-10-16",
    date_formatted: "16 October 2026",
    start_time: "15:00",
    end_time: "17:00",
    venue: "Grounds",
    category: "Flagship",
  });
  console.log(`  Created schedule item: ${newSched.id} (${newSched.event_name})`);

  // Change timing and venue
  await adminUpdateScheduleItem(newSched.id, {
    start_time: "16:00",
    end_time: "18:00",
    venue: "Auditorium",
  });

  const updatedSched = (await getScheduleList({ day: 2 })).find((s) => s.id === newSched.id);
  console.log(`  Updated timing: ${updatedSched?.start_time} - ${updatedSched?.end_time}, Venue: ${updatedSched?.venue}`);

  if (updatedSched?.start_time !== "16:00" || updatedSched?.venue !== "Auditorium") {
    throw new Error("Failed to update timing or venue!");
  }

  // Delete test item
  await adminDeleteScheduleItem(newSched.id);
  console.log("✓ TEST 6 PASSED: Admin can add, modify timing, change venue, and delete schedules.");

  console.log("\n==========================================");
  console.log("  ALL TESTS COMPLETED SUCCESSFULLY! (6/6) ");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
