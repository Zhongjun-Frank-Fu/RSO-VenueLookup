import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAllClassrooms,
  getClassroomBuildingCode,
  classrooms as classroomDataImport,
  ClassroomSpace,
} from "../../lib/classrooms";
import { buildings } from "../../lib/buildings";
import { FilterIcon, MapPinIcon } from "../icons/VenueIcons";
import { SearchIcon } from "../icons/SearchIcon";

export type ClassroomFilters = {
  search: string;
  capacityRange: [number, number] | null;
  roomTypes: string[];
  seatingTypes: string[];
  features: string[];
};

export const DEFAULT_CLASSROOM_FILTERS: ClassroomFilters = {
  search: "",
  capacityRange: null,
  roomTypes: [],
  seatingTypes: [],
  features: [],
};

const CAPACITY_RANGES: { label: string; range: [number, number] }[] = [
  { label: "<50", range: [0, 50] },
  { label: "50-150", range: [50, 150] },
  { label: "150-300", range: [150, 300] },
  { label: "300+", range: [300, 99999] },
];

const ROOM_TYPES = classroomDataImport.room_types;
const SEATING_TYPES = classroomDataImport.seating_types.filter(
  (s) => s !== "N/A" && s !== "None" && s !== "Unknown"
);

const FEATURE_FILTERS = [
  { id: "无障碍", label: "无障碍" },
  { id: "投影室", label: "投影室" },
  { id: "黑板/白板", label: "黑板/白板" },
  { id: "有窗户", label: "有窗户" },
  { id: "讲台", label: "讲台" },
  { id: "支持Zoom", label: "支持Zoom" },
  { id: "影音设备", label: "影音设备" },
  { id: "轮椅位", label: "轮椅位" },
];

export function matchesClassroomFilters(
  space: ClassroomSpace,
  filters: ClassroomFilters
): boolean {
  if (filters.search) {
    const s = filters.search.toLowerCase();
    const searchable =
      `${space.registrar_code} ${space.room} ${space.building_name} ${space.room_type} ${space.seating_type} ${space.features.join(" ")} ${space.equipment.join(" ")}`.toLowerCase();
    if (!searchable.includes(s)) return false;
  }
  if (filters.capacityRange) {
    const [min, max] = filters.capacityRange;
    const cap = space.capacity ?? 0;
    if (cap < min || cap > max) return false;
  }
  if (filters.roomTypes.length > 0) {
    if (!filters.roomTypes.includes(space.room_type)) return false;
  }
  if (filters.seatingTypes.length > 0) {
    if (!filters.seatingTypes.includes(space.seating_type)) return false;
  }
  if (filters.features.length > 0) {
    if (!filters.features.every((f) => space.features.includes(f)))
      return false;
  }
  return true;
}

export function getFilteredClassroomBuildingCodes(
  filters: ClassroomFilters
): Set<string> {
  const codes = new Set<string>();
  for (const [code, bldg] of Object.entries(
    classroomDataImport.classrooms
  )) {
    if (bldg.spaces.some((s) => matchesClassroomFilters(s, filters))) {
      codes.add(code);
    }
  }
  return codes;
}

export function countFilteredClassrooms(filters: ClassroomFilters): number {
  let count = 0;
  for (const bldg of Object.values(classroomDataImport.classrooms)) {
    count += bldg.spaces.filter((s) =>
      matchesClassroomFilters(s, filters)
    ).length;
  }
  return count;
}

type SearchResult = {
  registrarCode: string;
  roomType: string;
  buildingCode: string;
  buildingName: string;
  capacity: number | null;
};

type ClassroomFilterProps = {
  filters: ClassroomFilters;
  onChange: (filters: ClassroomFilters) => void;
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

export function ClassroomFilter({
  filters,
  onChange,
  resultCount,
  onScrollToBuilding,
}: ClassroomFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCount =
    (filters.capacityRange ? 1 : 0) +
    filters.roomTypes.length +
    filters.seatingTypes.length +
    filters.features.length;

  const searchResults = useMemo((): SearchResult[] => {
    const q = filters.search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const all = getAllClassrooms();
    return all
      .filter(
        (c) =>
          c.registrar_code.toLowerCase().includes(q) ||
          c.room.toLowerCase().includes(q) ||
          c.building_name.toLowerCase().includes(q) ||
          c.room_type.toLowerCase().includes(q) ||
          c.features.some((f) => f.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((c) => {
        const code = getClassroomBuildingCode(c.id) ?? "";
        return {
          registrarCode: c.registrar_code,
          roomType: c.room_type,
          buildingCode: code,
          buildingName: buildings[code]?.name ?? code,
          capacity: c.capacity,
        };
      });
  }, [filters.search]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const items =
        resultsRef.current.querySelectorAll(".venue-search-result");
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const selectResult = useCallback(
    (result: SearchResult) => {
      onScrollToBuilding(result.buildingCode);
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
        setActiveIndex((i) =>
          i < searchResults.length - 1 ? i + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          i > 0 ? i - 1 : searchResults.length - 1
        );
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showResults = focused && searchResults.length > 0;

  return (
    <div className="venue-filter" ref={containerRef}>
      {showResults && (
        <div
          className="venue-search-backdrop"
          onClick={() => {
            setFocused(false);
            inputRef.current?.blur();
          }}
        />
      )}

      <div
        className={`venue-filter-bar ${
          focused ? "venue-filter-bar-focused" : ""
        }`}
      >
        <div
          className={`venue-search-wrapper ${
            focused ? "venue-search-wrapper-focused" : ""
          }`}
        >
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className="venue-search"
            placeholder="搜索教室、建筑、特征..."
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
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
          className={`venue-filter-toggle ${
            activeCount > 0 ? "active" : ""
          }`}
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
            <label className="venue-filter-label">容量</label>
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
            <label className="venue-filter-label">房间类型</label>
            <div className="venue-filter-chips">
              {ROOM_TYPES.map((type) => (
                <button
                  key={type}
                  className={`venue-chip ${
                    filters.roomTypes.includes(type)
                      ? "venue-chip-active"
                      : ""
                  }`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      roomTypes: filters.roomTypes.includes(type)
                        ? filters.roomTypes.filter((t) => t !== type)
                        : [...filters.roomTypes, type],
                    })
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="venue-filter-group">
            <label className="venue-filter-label">座位类型</label>
            <div className="venue-filter-chips">
              {SEATING_TYPES.map((type) => (
                <button
                  key={type}
                  className={`venue-chip ${
                    filters.seatingTypes.includes(type)
                      ? "venue-chip-active"
                      : ""
                  }`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      seatingTypes: filters.seatingTypes.includes(type)
                        ? filters.seatingTypes.filter((t) => t !== type)
                        : [...filters.seatingTypes, type],
                    })
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="venue-filter-group">
            <label className="venue-filter-label">设施特征</label>
            <div className="venue-filter-chips">
              {FEATURE_FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  className={`venue-chip ${
                    filters.features.includes(id)
                      ? "venue-chip-active"
                      : ""
                  }`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      features: filters.features.includes(id)
                        ? filters.features.filter((f) => f !== id)
                        : [...filters.features, id],
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <button
              className="venue-filter-clear"
              onClick={() =>
                onChange({
                  ...DEFAULT_CLASSROOM_FILTERS,
                  search: filters.search,
                })
              }
            >
              清除筛选
            </button>
          )}
        </div>
      )}

      {showResults && (
        <div className="venue-search-results" ref={resultsRef}>
          <div className="venue-search-results-header">
            {searchResults.length} 个结果
          </div>
          {searchResults.map((r, i) => (
            <button
              key={`${r.buildingCode}-${r.registrarCode}-${i}`}
              className={`venue-search-result ${
                i === activeIndex ? "venue-search-result-active" : ""
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => selectResult(r)}
            >
              <MapPinIcon size={14} />
              <div className="venue-search-result-info">
                <span className="venue-search-result-name">
                  {r.registrarCode}
                </span>
                <span className="venue-search-result-building">
                  {r.buildingName}
                  {r.capacity ? ` · ${r.capacity} 座` : ""}
                  {` · ${r.roomType}`}
                </span>
              </div>
            </button>
          ))}
          <div className="venue-search-hint">
            <kbd>&uarr;</kbd>
            <kbd>&darr;</kbd> 导航 <kbd>&crarr;</kbd> 选择{" "}
            <kbd>esc</kbd> 关闭
          </div>
        </div>
      )}
    </div>
  );
}
