import { useState } from "react";
import { VenueSpace } from "../../lib/venues";

type LibraryWalkViewProps = {
  spaces: VenueSpace[];
  onSelectVenue: (venue: VenueSpace) => void;
};

const WALK_PHOTOS = [
  "/venue-images/library-walk/hero-1.jpg",
  "/venue-images/library-walk/hero-2.jpg",
  "/venue-images/library-walk/hero-3.jpg",
  "/venue-images/library-walk/hero-4.jpg",
];

// Three segments of Library Walk with their numbering ranges
const SEGMENTS: {
  id: string;
  label: string;
  range: string;
  desc: string;
  yStart: number;
  yEnd: number;
  color: string;
}[] = [
  {
    id: "library-walk-north",
    label: "North",
    range: "1967 – 1993",
    desc: "图书馆前 / Price Center 前",
    yStart: 10,
    yEnd: 36,
    color: "#8B0000",
  },
  {
    id: "library-walk-central",
    label: "Central",
    range: "1994 – 2003",
    desc: "靠近 Target",
    yStart: 38,
    yEnd: 64,
    color: "#A0522D",
  },
  {
    id: "library-walk-south",
    label: "South",
    range: "2003 – 2052",
    desc: "靠近 Center Hall",
    yStart: 66,
    yEnd: 92,
    color: "#556B2F",
  },
];

function SegmentBlock({
  segment,
  space,
  onClick,
}: {
  segment: (typeof SEGMENTS)[number];
  space: VenueSpace | undefined;
  onClick: () => void;
}) {
  const midY = (segment.yStart + segment.yEnd) / 2;
  const height = segment.yEnd - segment.yStart;

  return (
    <g className="walk-segment" onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Segment background band */}
      <rect
        x={38}
        y={segment.yStart}
        width={24}
        height={height}
        rx={3}
        fill={segment.color}
        opacity={0.06}
        className="walk-segment-bg"
      />

      {/* Segment border lines */}
      <line
        x1={38} y1={segment.yStart} x2={62} y2={segment.yStart}
        stroke={segment.color} strokeWidth={0.4} opacity={0.3}
      />
      <line
        x1={38} y1={segment.yEnd} x2={62} y2={segment.yEnd}
        stroke={segment.color} strokeWidth={0.4} opacity={0.3}
      />

      {/* Walk path segment (dashed center line) */}
      <line
        x1={50} y1={segment.yStart + 1} x2={50} y2={segment.yEnd - 1}
        stroke={segment.color} strokeWidth={1.2} strokeDasharray="3 2" opacity={0.35}
      />

      {/* Dot marker */}
      <circle cx={50} cy={midY} r={2.2} fill={segment.color} />
      <circle cx={50} cy={midY} r={3.5} fill={segment.color} opacity={0.15} />

      {/* Right side: segment label & range */}
      <text x={65} y={midY - 4} textAnchor="start" className="walk-segment-label" fill={segment.color}>
        {segment.label}
      </text>
      <text x={65} y={midY + 0.5} textAnchor="start" className="walk-segment-range">
        {segment.range}
      </text>
      <text x={65} y={midY + 5} textAnchor="start" className="walk-segment-desc">
        {segment.desc}
      </text>

      {/* Left side: Tabling Space type tag */}
      <text x={35} y={midY - 1} textAnchor="end" className="walk-marker-name">
        {space?.name ?? segment.label}
      </text>
      <text x={35} y={midY + 3.5} textAnchor="end" className="walk-marker-type">
        Tabling Space
      </text>
    </g>
  );
}

function WalkGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  return (
    <div className="walk-gallery">
      <div className="walk-gallery-main">
        <img
          src={WALK_PHOTOS[activeIdx]}
          alt={`Library Walk photo ${activeIdx + 1}`}
          className="walk-gallery-hero"
        />
      </div>
      <div className="walk-gallery-thumbs">
        {WALK_PHOTOS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Library Walk ${i + 1}`}
            className={`walk-gallery-thumb ${i === activeIdx ? "walk-gallery-thumb-active" : ""}`}
            onClick={() => setActiveIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}

export function LibraryWalkView({ spaces, onSelectVenue }: LibraryWalkViewProps) {
  // Build lookup by id
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));

  return (
    <div className="walk-view">
      <WalkGallery />
      <div className="walk-view-header">
        <svg className="icon" width={14} height={14} viewBox="0 0 24 24" style={{ color: "#8B0000" }}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span>Corridor Map — 3 Segments</span>
      </div>
      <svg
        viewBox="0 0 100 100"
        className="walk-view-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="walkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B0000" stopOpacity={0.05} />
            <stop offset="50%" stopColor="#8B0000" stopOpacity={0.02} />
            <stop offset="100%" stopColor="#8B0000" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Walk corridor background */}
        <rect x={46} y={8} width={8} height={86} rx={4} fill="url(#walkGrad)" />

        {/* Direction labels */}
        <text x={50} y={7} textAnchor="middle" className="walk-landmark-arrow">
          N
        </text>
        <text x={50} y={5} textAnchor="middle" className="walk-landmark">
          Geisel Library
        </text>

        <text x={50} y={98} textAnchor="middle" className="walk-landmark">
          Center Hall
        </text>

        {/* Segment blocks */}
        {SEGMENTS.map((seg) => {
          const space = spaceMap.get(seg.id);
          return (
            <SegmentBlock
              key={seg.id}
              segment={seg}
              space={space}
              onClick={() => {
                if (space) onSelectVenue(space);
              }}
            />
          );
        })}
      </svg>
      <p className="walk-view-hint">Click a segment for details</p>
    </div>
  );
}
