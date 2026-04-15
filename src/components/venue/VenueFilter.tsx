import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SYSTEM_COLORS, getAllVenues, getVenueBuildingCode } from "../../lib/venues";
import { buildings } from "../../lib/buildings";
import { FilterIcon, LocationIcon, MapPinIcon } from "../icons/VenueIcons";
import { SearchIcon } from "../icons/SearchIcon";

export type VenueFilters = {
  search: string;
  capacityRange: [number, number] | null;
  systems: string[];
  tags: string[];
  venueTypes: string[];
  rsoFreeOnly: boolean;
};

export const DEFAULT_FILTERS: VenueFilters = {
  search: "",
  capacityRange: null,
  systems: [],
  tags: [],
  venueTypes: [],
  rsoFreeOnly: false,
};

const CAPACITY_RANGES: { label: string; range: [number, number] }[] = [
  { label: "<50", range: [0, 50] },
  { label: "50-200", range: [50, 200] },
  { label: "200-500", range: [200, 500] },
  { label: "500+", range: [500, 99999] },
];

const SYSTEMS = [
  { id: "university-centers", label: "University Centers" },
  { id: "hcs", label: "HCS" },
  { id: "recreation", label: "Recreation" },
  { id: "theatre-dance", label: "Theatre & Dance" },
  { id: "classroom", label: "Classroom" },
  { id: "independent", label: "Independent" },
];

// Activity/usage tags
const TAGS = [
  { id: "春晚", label: "春晚", emoji: "" },
  { id: "新生见面会", label: "新生见面会", emoji: "" },
  { id: "职业宣讲会", label: "职业宣讲会", emoji: "" },
  { id: "学术讲座", label: "学术讲座", emoji: "" },
  { id: "部门例会", label: "部门例会", emoji: "" },
  { id: "户外集市", label: "户外集市", emoji: "" },
  { id: "高端宴会", label: "高端宴会", emoji: "" },
  { id: "音乐会", label: "音乐会", emoji: "" },
  { id: "体育", label: "体育", emoji: "" },
  { id: "大型户外活动", label: "大型户外活动", emoji: "" },
];

// Venue type categories (grouped from the 50+ unique types)
export const VENUE_TYPES = [
  { id: "ballroom", label: "Ballroom", match: ["ballroom", "多功能厅", "超大 ballroom"] },
  { id: "meeting", label: "Meeting Room", match: ["meeting room", "conference", "boardroom", "议事厅"] },
  { id: "theater", label: "Theater / Auditorium", match: ["theater", "theatre", "auditorium", "影院", "concert hall", "recital hall"] },
  { id: "outdoor", label: "Outdoor", match: ["户外", "outdoor", "amphitheatre", "草坪", "广场", "步行街", "通道"] },
  { id: "studio", label: "Studio / Lab", match: ["studio", "dance", "black box", "实验剧场"] },
  { id: "sports", label: "Sports / Arena", match: ["gymnasium", "arena", "pool", "运动", "体育馆"] },
  { id: "lounge", label: "Lounge / Special", match: ["lounge", "酒廊", "rooftop", "屋顶", "海景", "露台"] },
];

/** Check if a venue's type matches a venueType filter category */
export function matchesVenueType(venueType: string, categoryId: string): boolean {
  const cat = VENUE_TYPES.find((t) => t.id === categoryId);
  if (!cat) return false;
  const lower = venueType.toLowerCase();
  return cat.match.some((m) => lower.includes(m.toLowerCase()));
}

type SearchResult = {
  venueName: string;
  buildingCode: string;
  buildingName: string;
  maxCapacity: number | null;
  rsoFree: boolean;
};

type VenueFilterProps = {
  filters: VenueFilters;
  onChange: (filters: VenueFilters) => void;
  resultCount: number;
  onScrollToBuilding: (code: string) => void;
};

function ClearIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export function VenueFilter({
  filters,
  onChange,
  resultCount,
  onScrollToBuilding,
}: VenueFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCount =
    (filters.capacityRange ? 1 : 0) +
    filters.systems.length +
    filters.tags.length +
    filters.venueTypes.length +
    (filters.rsoFreeOnly ? 1 : 0);

  const searchResults = useMemo((): SearchResult[] => {
    const q = filters.search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const allVenues = getAllVenues();
    return allVenues
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.description.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          v.equipment.some((e) => e.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((v) => {
        const code = getVenueBuildingCode(v.id) ?? "";
        return {
          venueName: v.name,
          buildingCode: code,
          buildingName: buildings[code]?.name ?? code,
          maxCapacity: v.max_capacity,
          rsoFree: v.rso_free,
        };
      });
  }, [filters.search]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchResults]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll(".venue-search-result");
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const selectResult = useCallback(
    (result: SearchResult) => {
      onScrollToBuilding(result.buildingCode);
      // Don't clear search — user might want to browse results
      inputRef.current?.blur();
      setFocused(false);
    },
    [onScrollToBuilding]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!searchResults.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < searchResults.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : searchResults.length - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        selectResult(searchResults[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        inputRef.current?.blur();
        setFocused(false);
      }
    },
    [searchResults, activeIndex, selectResult]
  );

  // Close results on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showResults = focused && searchResults.length > 0;

  return (
    <div className="venue-filter" ref={containerRef}>
      {/* Backdrop overlay when search is active */}
      {showResults && (
        <div
          className="venue-search-backdrop"
          onClick={() => {
            setFocused(false);
            inputRef.current?.blur();
          }}
        />
      )}

      <div className={`venue-filter-bar ${focused ? "venue-filter-bar-focused" : ""}`}>
        <div className={`venue-search-wrapper ${focused ? "venue-search-wrapper-focused" : ""}`}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className="venue-search"
            placeholder="Search venues, tags, equipment..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
          />
          {filters.search && (
            <button
              className="venue-search-clear"
              onClick={() => {
                onChange({ ...filters, search: "" });
                inputRef.current?.focus();
              }}
            >
              <ClearIcon size={12} />
            </button>
          )}
        </div>
        <button
          className={`venue-filter-toggle ${activeCount > 0 ? "active" : ""}`}
          onClick={() => {
            setExpanded(!expanded);
            setFocused(false);
          }}
        >
          <FilterIcon size={14} />
          {activeCount > 0 ? `${activeCount}` : ""}
        </button>
        <span className="venue-result-count">{resultCount}</span>
      </div>

      {expanded && (
        <div className="venue-filter-panel">
          <div className="venue-filter-group">
            <label className="venue-filter-label">Capacity</label>
            <div className="venue-filter-chips">
              {CAPACITY_RANGES.map(({ label, range }) => (
                <button
                  key={label}
                  className={`venue-chip ${
                    filters.capacityRange?.[0] === range[0] &&
                    filters.capacityRange?.[1] === range[1]
                      ? "venue-chip-active"
                      : ""
                  }`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      capacityRange:
                        filters.capacityRange?.[0] === range[0]
                          ? null
                          : range,
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="venue-filter-group">
            <label className="venue-filter-label">System</label>
            <div className="venue-filter-chips">
              {SYSTEMS.map(({ id, label }) => (
                <button
                  key={id}
                  className={`venue-chip ${
                    filters.systems.includes(id) ? "venue-chip-active" : ""
                  }`}
                  style={
                    filters.systems.includes(id)
                      ? {
                          backgroundColor: SYSTEM_COLORS[id],
                          borderColor: SYSTEM_COLORS[id],
                          color: "#fff",
                        }
                      : {}
                  }
                  onClick={() =>
                    onChange({
                      ...filters,
                      systems: filters.systems.includes(id)
                        ? filters.systems.filter((s) => s !== id)
                        : [...filters.systems, id],
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="venue-filter-group">
            <label className="venue-filter-label">Venue Type</label>
            <div className="venue-filter-chips">
              {VENUE_TYPES.map(({ id, label }) => (
                <button
                  key={id}
                  className={`venue-chip ${
                    filters.venueTypes.includes(id) ? "venue-chip-active" : ""
                  }`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      venueTypes: filters.venueTypes.includes(id)
                        ? filters.venueTypes.filter((t) => t !== id)
                        : [...filters.venueTypes, id],
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="venue-filter-group">
            <label className="venue-filter-label">Activity Tags</label>
            <div className="venue-filter-chips">
              {TAGS.map(({ id, label }) => (
                <button
                  key={id}
                  className={`venue-chip venue-chip-tag ${
                    filters.tags.includes(id) ? "venue-chip-tag-active" : ""
                  }`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      tags: filters.tags.includes(id)
                        ? filters.tags.filter((t) => t !== id)
                        : [...filters.tags, id],
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="venue-filter-group">
            <label className="venue-filter-label venue-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.rsoFreeOnly}
                onChange={(e) =>
                  onChange({ ...filters, rsoFreeOnly: e.target.checked })
                }
              />
              RSO Free only
            </label>
          </div>

          {activeCount > 0 && (
            <button
              className="venue-filter-clear"
              onClick={() => onChange({ ...DEFAULT_FILTERS, search: filters.search })}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Search results dropdown */}
      {showResults && (
        <div className="venue-search-results" ref={resultsRef}>
          <div className="venue-search-results-header">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </div>
          {searchResults.map((r, i) => (
            <button
              key={`${r.buildingCode}-${r.venueName}-${i}`}
              className={`venue-search-result ${
                i === activeIndex ? "venue-search-result-active" : ""
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => selectResult(r)}
            >
              <MapPinIcon size={14} />
              <div className="venue-search-result-info">
                <span className="venue-search-result-name">{r.venueName}</span>
                <span className="venue-search-result-building">
                  {r.buildingName}
                  {r.maxCapacity ? ` · ${r.maxCapacity} pax` : ""}
                </span>
              </div>
              {r.rsoFree && <span className="venue-search-result-free">Free</span>}
            </button>
          ))}
          <div className="venue-search-hint">
            <kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> select <kbd>esc</kbd> close
          </div>
        </div>
      )}
    </div>
  );
}
