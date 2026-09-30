"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import AddCalendarModal from "./AddCalendarModal";

interface AddCalendarButtonProps {
  className?: string;
  label?: string;
  id?: string;
  style?: React.CSSProperties;
}

export default function AddCalendarButton({
  className = "btn-primary",
  label = "📅 ADD TO GOOGLE CALENDAR",
  id = "btn-add-to-google-calendar",
  style,
}: AddCalendarButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setModalOpen(true)}
        id={id}
        style={style}
      >
        <Calendar size={18} /> {label}
      </button>

      <AddCalendarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
