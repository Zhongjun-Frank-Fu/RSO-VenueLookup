import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BuildingDatum } from "../../lib/buildings";
import {
  ClassroomSpace,
  getClassroomsForBuilding,
  getRoomTypeColor,
  getBookingChannelColor,
  classrooms as classroomDataImport,
} from "../../lib/classrooms";
import { ClassroomCard } from "./ClassroomCard";
import { ClassroomDetail } from "./ClassroomDetail";
import { BuildingIcon, FilterIcon } from "../icons/VenueIcons";
import { CloseIcon } from "../icons/CloseIcon";

type ClassroomPanelProps = {
  building: BuildingDatum;
  visible: boolean;
  rightPanelOpen: boolean;
  onClose: () => void;
};

export function ClassroomPanel({
  building,
  visible,
  rightPanelOpen,
  onClose,
}: ClassroomPanelProps) {
  const [selectedClassroom, setSelectedClassroom] =
    useState<ClassroomSpace | null>(null);
  const [panelSearch, setPanelSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScroll: number } | null>(null);

  // Reset when building changes
  useEffect(() => {
    setSelectedClassroom(null);
    setPanelSearch("");
  }, [building.code]);

  const spaces = useMemo(
    () => getClassroomsForBuilding(building.code) ?? [],
    [building.code]
  );

  const filteredSpaces = useMemo(() => {
    if (!panelSearch.trim()) return spaces;
    const q = panelSearch.toLowerCase();
    return spaces.filter(
      (s) =>
        s.room.toLowerCase().includes(q) ||
        s.registrar_code.toLowerCase().includes(q) ||
        s.room_type.toLowerCase().includes(q) ||
        s.seating_type.toLowerCase().includes(q) ||
        s.features.some((f) => f.toLowerCase().includes(q)) ||
        s.equipment.some((e) => e.toLowerCase().includes(q))
    );
  }, [spaces, panelSearch]);

  // Collect unique room types for display
  const roomTypes = useMemo(() => {
    const types = new Set(spaces.map((s) => s.room_type));
    return [...types];
  }, [spaces]);

  const primaryType = roomTypes[0] ?? "Unknown";
  const primaryColor = getRoomTypeColor(primaryType);

  // Collect unique booking channels
  const bookingChannels = useMemo(() => {
    const channels = new Set(spaces.map((s) => s.booking_channel));
    return [...channels];
  }, [spaces]);

  // Swipe-down on header to close panel (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const panel = panelRef.current;
    if (!panel) return;
    dragRef.current = {
      startY: e.touches[0].clientY,
      startScroll: panel.scrollTop,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!dragRef.current) return;
      const dy = e.changedTouches[0].clientY - dragRef.current.startY;
      if (dragRef.current.startScroll <= 0 && dy > 80) {
        onClose();
      }
      dragRef.current = null;
    },
    [onClose]
  );

  // ESC key closes panel or detail
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedClassroom) {
          setSelectedClassroom(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, selectedClassroom, onClose]);

  // Detail view
  if (selectedClassroom) {
    return (
      <div
        ref={panelRef}
        className={`venue-panel ${visible ? "venue-panel-visible" : ""} ${
          rightPanelOpen ? "venue-panel-right-open" : ""
        }`}
      >
        <ClassroomDetail
          classroom={selectedClassroom}
          onClose={() => setSelectedClassroom(null)}
        />
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`venue-panel ${visible ? "venue-panel-visible" : ""} ${
        rightPanelOpen ? "venue-panel-right-open" : ""
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="venue-panel-header"
        style={{ borderBottomColor: primaryColor }}
      >
        <div className="venue-panel-drag-handle" />
        <div className="venue-panel-header-top">
          <div>
            <h2 className="venue-panel-title">
              <BuildingIcon size={18} />
              {building.name}
            </h2>
            <div className="venue-panel-systems">
              {roomTypes.map((type) => (
                <span
                  key={type}
                  className="venue-system-tag"
                  style={{ backgroundColor: getRoomTypeColor(type) }}
                >
                  {type}
                </span>
              ))}
              {bookingChannels.map((chId) => {
                const sys = classroomDataImport.booking_systems.find((s) => s.id === chId);
                return (
                  <span
                    key={chId}
                    className="venue-system-tag"
                    style={{ backgroundColor: getBookingChannelColor(chId) }}
                  >
                    {sys?.short_name ?? chId}
                  </span>
                );
              })}
            </div>
          </div>
          <button
            className="venue-panel-close"
            onClick={onClose}
            title="Close (Esc)"
          >
            <CloseIcon />
          </button>
        </div>
        <p className="venue-panel-count">{spaces.length} 个教室</p>
      </div>

      {/* In-panel search */}
      {spaces.length > 3 && (
        <div className="venue-panel-search-bar">
          <FilterIcon size={14} />
          <input
            type="text"
            className="venue-panel-search"
            placeholder={`在 ${building.name} 中搜索...`}
            value={panelSearch}
            onChange={(e) => setPanelSearch(e.target.value)}
          />
          {panelSearch && (
            <span className="venue-panel-search-count">
              {filteredSpaces.length}/{spaces.length}
            </span>
          )}
        </div>
      )}

      <div className="venue-panel-list">
        {filteredSpaces.length === 0 ? (
          <p className="venue-panel-empty">没有匹配的教室</p>
        ) : (
          filteredSpaces.map((space) => (
            <ClassroomCard
              key={space.id}
              classroom={space}
              onClick={() => setSelectedClassroom(space)}
            />
          ))
        )}
      </div>
    </div>
  );
}
