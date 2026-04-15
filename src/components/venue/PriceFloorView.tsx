import { useMemo, useState } from "react";
import { VenueSpace } from "../../lib/venues";
import { getVenuePhoto } from "../../lib/venue-images";
import { VenueCard } from "./VenueCard";

type PriceFloorViewProps = {
  spaces: VenueSpace[];
  onSelectVenue: (venue: VenueSpace) => void;
  onClosePanel: () => void;
};

type FloorInfo = {
  id: string;
  label: string;
  description: string;
  floorPlanImage?: string;
  match: (s: VenueSpace) => boolean;
};

const FLOORS: FloorInfo[] = [
  {
    id: "l1",
    label: "L1",
    description: "Theater",
    match: (s) => (s.floor ?? s.location ?? "").includes("L1"),
  },
  {
    id: "l2",
    label: "L2",
    description: "Ballrooms, meeting rooms, The LOFT, Dance Studio",
    floorPlanImage: "/venue-images/price-center/floor-L2.jpg",
    match: (s) => (s.floor ?? s.location ?? "").includes("L2"),
  },
  {
    id: "l3",
    label: "L3",
    description: "Warren College Room, Sixth College Room",
    floorPlanImage: "/venue-images/price-center/floor-L3.jpg",
    match: (s) => (s.floor ?? s.location ?? "").includes("L3"),
  },
  {
    id: "l4",
    label: "L4",
    description: "The Forum, Governance Chambers, Student Leadership",
    match: (s) => (s.floor ?? s.location ?? "").includes("L4"),
  },
  {
    id: "outdoor",
    label: "Outdoor",
    description: "Plaza and outdoor event spaces",
    match: (s) => {
      const loc = (s.floor ?? s.location ?? "").toLowerCase();
      const typ = s.type.toLowerCase();
      return (
        typ.includes("户外") ||
        typ.includes("outdoor") ||
        loc.includes("outdoor") ||
        loc.includes("plaza") ||
        loc.includes("中庭")
      );
    },
  },
];

function FloorPlanImage({ src, label }: { src: string; label: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`floor-plan-image ${expanded ? "floor-plan-image-expanded" : ""}`}>
      <img
        src={src}
        alt={`Price Center ${label} floor plan`}
        onClick={() => setExpanded(!expanded)}
        loading="lazy"
      />
      <span className="floor-plan-hint" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Click to collapse" : "Click to expand floor plan"}
      </span>
    </div>
  );
}

function FloorIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm-2 5h2V2H7v2H2v4h5v2H4v4h3v2H2v4h7v2z" />
    </svg>
  );
}

export function PriceFloorView({
  spaces,
  onSelectVenue,
  onClosePanel,
}: PriceFloorViewProps) {
  const [activeFloor, setActiveFloor] = useState("l1");

  const floorGroups = useMemo(() => {
    const groups: Record<string, VenueSpace[]> = {};
    const assigned = new Set<string>();

    for (const floor of FLOORS) {
      groups[floor.id] = spaces.filter((s) => {
        if (assigned.has(s.id)) return false;
        if (floor.match(s)) {
          assigned.add(s.id);
          return true;
        }
        return false;
      });
    }

    return groups;
  }, [spaces]);

  const currentFloor = FLOORS.find((f) => f.id === activeFloor);
  const currentSpaces = floorGroups[activeFloor] ?? [];

  // Count non-empty floors for badge display
  const floorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of FLOORS) {
      counts[f.id] = (floorGroups[f.id] ?? []).length;
    }
    return counts;
  }, [floorGroups]);

  return (
    <div className="floor-view">
      <div className="floor-view-header">
        <FloorIcon size={14} />
        <span>Floor Guide</span>
      </div>

      <div className="floor-tabs">
        {FLOORS.map((floor) => {
          const count = floorCounts[floor.id];
          if (count === 0) return null;
          return (
            <button
              key={floor.id}
              className={`floor-tab ${activeFloor === floor.id ? "floor-tab-active" : ""}`}
              onClick={() => setActiveFloor(floor.id)}
            >
              <span className="floor-tab-label">{floor.label}</span>
              <span className="floor-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {currentFloor && (
        <p className="floor-description">{currentFloor.description}</p>
      )}

      {currentFloor?.floorPlanImage && (
        <FloorPlanImage src={currentFloor.floorPlanImage} label={currentFloor.label} />
      )}

      <div className="floor-spaces">
        {currentSpaces.map((space) => (
          <VenueCard
            key={space.id}
            venue={space}
            imageUrl={getVenuePhoto(space.id)}
            onClick={() => onSelectVenue(space)}
            onDoubleClick={onClosePanel}
          />
        ))}
      </div>
    </div>
  );
}
