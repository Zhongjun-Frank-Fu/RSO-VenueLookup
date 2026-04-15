import { useState } from "react";

export type AppMode = "classroom" | "venue";

type ModeToggleProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

function ClassroomIcon() {
  return (
    <svg className="icon" width={14} height={14} viewBox="0 0 24 24">
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
    </svg>
  );
}

function VenueIcon() {
  return (
    <svg className="icon" width={14} height={14} viewBox="0 0 24 24">
      <path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z" />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className="icon mode-toggle-chevron"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      style={{
        transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`mode-toggle ${collapsed ? "mode-toggle-collapsed" : ""}`}>
      <button
        className="mode-toggle-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Show mode switcher" : "Hide mode switcher"}
      >
        <ChevronIcon collapsed={collapsed} />
      </button>
      <div className="mode-toggle-buttons">
        <button
          className={`mode-btn ${mode === "classroom" ? "mode-btn-active" : ""}`}
          onClick={() => onModeChange("classroom")}
          title="Classroom schedules"
        >
          <ClassroomIcon />
          <span className="mode-label">Classrooms</span>
        </button>
        <button
          className={`mode-btn ${mode === "venue" ? "mode-btn-active" : ""}`}
          onClick={() => onModeChange("venue")}
          title="Venue reservations"
        >
          <VenueIcon />
          <span className="mode-label">Venues</span>
        </button>
      </div>
    </div>
  );
}
