export interface Participant {
  id: string;
  name: string;
  normalized_name: string;
  email: string;
  phone?: string;
  class?: string;
  school: string;
  is_online?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventItem {
  id: string;
  name: string;
  category: string;
  device_allowance?: string;
  max_participants?: string;
  time_allotted?: string;
  description?: string;
  rules?: string;
  is_online?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventScheduleItem {
  id: string;
  event_id?: string;
  event_name: string;
  sub_round?: string;
  day: number; // 0: Online, 1: 15 Oct, 2: 16 Oct, 3: 17 Oct
  date: string; // YYYY-MM-DD
  date_formatted: string; // e.g. "15 October 2026"
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  time_range: string; // e.g. "11:30 AM – 01:00 PM"
  venue: string; // e.g. "Computer Lab", "Auditorium", "Grounds", "Classrooms", "ATL/Labs"
  category: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Registration {
  id: string;
  participant_id: string;
  event_id: string;
  role?: string;
  notes?: string;
  created_at?: string;
  // joined fields
  participant_name?: string;
  event_name?: string;
  participant_email?: string;
  participant_school?: string;
}

export interface ParticipantLookupResult {
  status: "found" | "not_found" | "multiple_matches";
  message?: string;
  count?: number;
  participant?: {
    id: string;
    name: string;
    class?: string;
    school: string;
  };
  events?: {
    eventId: string;
    eventName: string;
    category: string;
    deviceAllowance?: string;
    schedule: EventScheduleItem[];
  }[];
  commonEvents?: EventScheduleItem[];
  candidates?: {
    id: string;
    name: string;
    class?: string;
    school: string;
    maskedEmail: string;
    maskedPhone: string;
  }[];
}
