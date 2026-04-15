import { useRef } from "react";
import { VenueSpace, getSystemColor } from "../../lib/venues";
import {
  PeopleIcon,
  AreaIcon,
  LocationIcon,
  FreeIcon,
  StarIcon,
  ChevronRightIcon,
} from "../icons/VenueIcons";

type VenueCardProps = {
  venue: VenueSpace;
  imageUrl?: string;
  onClick: () => void;
  onDoubleClick?: () => void;
};

function formatCapacity(cap: VenueSpace["capacity"]): string {
  const parts: string[] = [];
  if (cap.theater) parts.push(`Theater ${cap.theater}`);
  if (cap.banquet) parts.push(`Banquet ${cap.banquet}`);
  if (cap.classroom) parts.push(`Classroom ${cap.classroom}`);
  if (cap.reception) parts.push(`Reception ${cap.reception}`);
  if (cap.boardroom) parts.push(`Boardroom ${cap.boardroom}`);
  if (cap.max) parts.push(`${cap.max}`);
  return parts.join(" / ");
}

function TagIcon({ size = 12 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
    </svg>
  );
}

export function VenueCard({ venue, imageUrl, onClick, onDoubleClick }: VenueCardProps) {
  const systemColor = getSystemColor(venue.system);
  const capText = formatCapacity(venue.capacity);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    if (clickTimer.current) {
      // Double click detected
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick?.();
    } else {
      // Wait to see if it's a double click
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onClick();
      }, 250);
    }
  };

  return (
    <button
      className="venue-card"
      style={{ borderLeftColor: systemColor }}
      onClick={handleClick}
    >
      {imageUrl && (
        <div className="venue-card-image">
          <img src={imageUrl} alt={venue.name} loading="lazy" />
        </div>
      )}
      <div className="venue-card-header">
        <h3 className="venue-card-name">{venue.name}</h3>
        <span className="venue-card-arrow">
          <ChevronRightIcon size={18} />
        </span>
      </div>

      <div className="venue-card-info-row">
        {venue.location && (
          <span className="venue-card-info-item">
            <LocationIcon size={12} />
            {venue.location}
          </span>
        )}
        {venue.area_sqft && (
          <span className="venue-card-info-item">
            <AreaIcon size={12} />
            {venue.area_sqft.toLocaleString()} sqft
          </span>
        )}
      </div>

      {(capText || venue.max_capacity) && (
        <div className="venue-card-capacity">
          <PeopleIcon size={14} />
          {venue.max_capacity && (
            <span className="venue-cap-badge">{venue.max_capacity}</span>
          )}
          {capText && <span className="venue-cap-detail">{capText}</span>}
        </div>
      )}

      {/* Tags */}
      {venue.tags.length > 0 && (
        <div className="venue-card-tags">
          <TagIcon size={11} />
          {venue.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="venue-tag">{tag}</span>
          ))}
          {venue.tags.length > 3 && (
            <span className="venue-tag venue-tag-more">+{venue.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="venue-card-footer">
        <div className="venue-card-badges">
          {venue.rso_free ? (
            <span className="venue-badge venue-badge-free">
              <FreeIcon size={11} />
              RSO Free
            </span>
          ) : (
            <span className="venue-badge venue-badge-paid">
              {venue.rates.rso.split("\n")[0]}
            </span>
          )}
        </div>

        {venue.equipment.length > 0 && (
          <div className="venue-card-equipment">
            {venue.equipment.slice(0, 3).map((eq) => (
              <span key={eq} className="venue-equip-tag">
                {eq}
              </span>
            ))}
            {venue.equipment.length > 3 && (
              <span className="venue-equip-tag">
                +{venue.equipment.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {venue.cssa_recommended && (
        <span className="venue-recommended-badge">
          <StarIcon size={10} />
          CSSA
        </span>
      )}
    </button>
  );
}
