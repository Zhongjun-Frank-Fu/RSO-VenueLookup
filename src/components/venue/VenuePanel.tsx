import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BuildingDatum } from "../../lib/buildings";
import {
  VenueSpace,
  getVenuesForBuilding,
  getSystemColor,
  venues,
} from "../../lib/venues";
import { VenueCard } from "./VenueCard";
import { VenueDetail } from "./VenueDetail";
import { LibraryWalkView } from "./LibraryWalkView";
import { PriceFloorView } from "./PriceFloorView";
import { BuildingIcon, FilterIcon } from "../icons/VenueIcons";
import { CloseIcon } from "../icons/CloseIcon";

// Buildings with special views
const SPECIAL_BUILDINGS = new Set(["LIBWK", "PRICE"]);

type VenuePanelProps = {
  building: BuildingDatum;
  visible: boolean;
  rightPanelOpen: boolean;
  onClose: () => void;
};

export function VenuePanel({
  building,
  visible,
  rightPanelOpen,
  onClose,
}: VenuePanelProps) {
  const [selectedVenue, setSelectedVenue] = useState<VenueSpace | null>(null);
  const [panelSearch, setPanelSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScroll: number } | null>(null);

  // Auto-close detail view when building changes
  useEffect(() => {
    setSelectedVenue(null);
    setPanelSearch("");
  }, [building.code]);

  const spaces = useMemo(
    () => getVenuesForBuilding(building.code) ?? [],
    [building.code]
  );

  const filteredSpaces = useMemo(() => {
    if (!panelSearch.trim()) return spaces;
    const q = panelSearch.toLowerCase();
    return spaces.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.equipment.some((e) => e.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [spaces, panelSearch]);

  // Collect unique systems
  const systemIds = useMemo(() => {
    const ids = new Set(spaces.map((s) => s.system));
    return [...ids];
  }, [spaces]);

  const primarySystem = systemIds[0] ?? "unknown";
  const primaryColor = getSystemColor(primarySystem);
  const primaryContact = spaces[0]?.contact?.split("\n")[0] ?? "";

  const isSpecial = SPECIAL_BUILDINGS.has(building.code);

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
        if (selectedVenue) {
          setSelectedVenue(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, selectedVenue, onClose]);

  // Detail view (any building)
  if (selectedVenue) {
    return (
      <div
        ref={panelRef}
        className={`venue-panel ${visible ? "venue-panel-visible" : ""} ${
          rightPanelOpen ? "venue-panel-right-open" : ""
        }`}
      >
        <VenueDetail
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
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
              {systemIds.map((sysId) => {
                const sys = venues.booking_systems.find((s) => s.id === sysId);
                return (
                  <span
                    key={sysId}
                    className="venue-system-tag"
                    style={{ backgroundColor: getSystemColor(sysId) }}
                  >
                    {sys?.short_name ?? sysId}
                  </span>
                );
              })}
            </div>
            {primaryContact && (
              <p className="venue-panel-contact">{primaryContact}</p>
            )}
          </div>
          <button className="venue-panel-close" onClick={onClose} title="Close (Esc)">
            <CloseIcon />
          </button>
        </div>
        <p className="venue-panel-count">
          {spaces.length} 个可预约空间
        </p>
      </div>

      {/* Special view: Library Walk corridor map */}
      {building.code === "LIBWK" && (
        <LibraryWalkView
          spaces={spaces}
          onSelectVenue={setSelectedVenue}
        />
      )}

      {/* Special view: Price Center floor guide */}
      {building.code === "PRICE" && (
        <PriceFloorView
          spaces={spaces}
          onSelectVenue={setSelectedVenue}
          onClosePanel={onClose}
        />
      )}

      {/* Default list view for non-special buildings */}
      {!isSpecial && (
        <>
          {/* In-panel search for buildings with many spaces */}
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
              <p className="venue-panel-empty">没有匹配的场地</p>
            ) : (
              filteredSpaces.map((space) => (
                <VenueCard
                  key={space.id}
                  venue={space}
                  onClick={() => setSelectedVenue(space)}
                  onDoubleClick={onClose}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
