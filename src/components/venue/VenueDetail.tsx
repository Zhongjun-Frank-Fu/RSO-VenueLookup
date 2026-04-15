import { useState } from "react";
import { VenueSpace, getSystemColor, venues } from "../../lib/venues";
import { getVenuePhotos } from "../../lib/venue-images";
import {
  PeopleIcon,
  AreaIcon,
  LocationIcon,
  StarIcon,
  EquipIcon,
  BookingIcon,
  FreeIcon,
} from "../icons/VenueIcons";
import { BackIcon } from "../icons/BackIcon";

type VenueDetailProps = {
  venue: VenueSpace;
  onClose: () => void;
};

const CAP_LABELS: Record<string, string> = {
  theater: "Theater",
  banquet: "Banquet",
  classroom: "Classroom",
  reception: "Reception",
  boardroom: "Boardroom",
  circle: "Circle",
  u_shape: "U-Shape",
  hollow_square: "Hollow Sq",
  max: "Max",
};

function CapacityGrid({ capacity }: { capacity: VenueSpace["capacity"] }) {
  const entries = Object.entries(capacity).filter(
    ([, v]) => v != null && v > 0
  );
  if (entries.length === 0) return null;
  return (
    <div className="venue-detail-section">
      <h4>
        <PeopleIcon size={14} />
        Capacity
      </h4>
      <div className="venue-capacity-grid">
        {entries.map(([key, val]) => (
          <div key={key} className="venue-capacity-item">
            <span className="venue-capacity-label">
              {CAP_LABELS[key] ?? key}
            </span>
            <span className="venue-capacity-value">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RateSection({
  rates,
  rsoFree,
}: {
  rates: VenueSpace["rates"];
  rsoFree: boolean;
}) {
  return (
    <div className="venue-detail-section">
      <h4>Rates</h4>
      <table className="venue-rate-table">
        <tbody>
          <tr>
            <td className="rate-label">RSO</td>
            <td className="rate-value">
              {rsoFree && (
                <span className="venue-badge venue-badge-free venue-badge-inline">
                  <FreeIcon size={11} />
                  Free
                </span>
              )}
              {rates.rso}
            </td>
          </tr>
          {rates.department && (
            <tr>
              <td className="rate-label">Department</td>
              <td className="rate-value">{rates.department}</td>
            </tr>
          )}
          {rates.external && (
            <tr>
              <td className="rate-label">External</td>
              <td className="rate-value">{rates.external}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function extractUrl(text: string): string | null {
  const full = text.match(/https?:\/\/[^\s,)]+/);
  if (full) return full[0];
  const bare = text.match(/[a-z0-9-]+\.[a-z0-9-]+\.edu[^\s,)]*/i);
  if (bare) return `https://${bare[0]}`;
  return null;
}

function PhotoGallery({ photos }: { photos: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (photos.length === 0) return null;
  return (
    <div className="venue-detail-gallery">
      <img
        src={photos[activeIdx]}
        alt="Venue photo"
        className="venue-detail-gallery-hero"
      />
      {photos.length > 1 && (
        <div className="venue-detail-gallery-thumbs">
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Photo ${i + 1}`}
              className={`venue-detail-gallery-thumb ${i === activeIdx ? "venue-detail-gallery-thumb-active" : ""}`}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function VenueDetail({ venue, onClose }: VenueDetailProps) {
  const systemColor = getSystemColor(venue.system);
  const photos = getVenuePhotos(venue.id);
  const bookingSystem = venues.booking_systems.find(
    (s) => s.id === venue.system
  );
  const bookingUrl =
    extractUrl(venue.booking_method ?? "") ??
    extractUrl(bookingSystem?.method ?? "");

  return (
    <div className="venue-detail">
      <div
        className="venue-detail-header"
        style={{ borderBottomColor: systemColor }}
      >
        <div className="venue-detail-header-content">
          <button className="venue-detail-back" onClick={onClose}>
            <BackIcon />
            <span>Back</span>
          </button>
          <h3 className="venue-detail-name">{venue.name}</h3>
          <div className="venue-detail-meta-row">
            {venue.location && (
              <span className="venue-detail-meta-item">
                <LocationIcon size={13} />
                {venue.location}
              </span>
            )}
            {venue.area_sqft && (
              <span className="venue-detail-meta-item">
                <AreaIcon size={13} />
                {venue.area_sqft.toLocaleString()} sqft
              </span>
            )}
            {venue.max_capacity && (
              <span className="venue-detail-meta-item">
                <PeopleIcon size={13} />
                Max {venue.max_capacity}
              </span>
            )}
          </div>
          <span
            className="venue-system-tag"
            style={{ backgroundColor: systemColor }}
          >
            {bookingSystem?.short_name ?? venue.system}
          </span>
        </div>
      </div>

      <PhotoGallery photos={photos} />

      {venue.description && (
        <div className="venue-detail-section">
          <p className="venue-detail-desc">{venue.description}</p>
        </div>
      )}

      {venue.cssa_recommended && (
        <div className="venue-detail-section venue-cssa-recommend-section">
          <div className="venue-cssa-recommend-badge">
            <StarIcon size={13} />
            <span>CSSA Recommended</span>
          </div>
          {venue.notes && (
            <p className="venue-cssa-recommend-note">{venue.notes}</p>
          )}
        </div>
      )}

      <CapacityGrid capacity={venue.capacity} />
      <RateSection rates={venue.rates} rsoFree={venue.rso_free} />

      {venue.equipment.length > 0 && (
        <div className="venue-detail-section">
          <h4>
            <EquipIcon size={14} />
            Equipment
          </h4>
          <div className="venue-detail-equipment">
            {venue.equipment.map((eq) => (
              <span key={eq} className="venue-equip-tag">
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="venue-detail-section">
        <h4>
          <BookingIcon size={14} />
          Booking
        </h4>
        <div className="venue-detail-booking">
          {venue.booking_method && (
            <div className="venue-booking-row">
              <span className="venue-booking-label">Method</span>
              <span className="venue-booking-value">{venue.booking_method}</span>
            </div>
          )}
          {venue.contact && (
            <div className="venue-booking-row">
              <span className="venue-booking-label">Contact</span>
              <span className="venue-booking-value">{venue.contact}</span>
            </div>
          )}
          {venue.managed_by && (
            <div className="venue-booking-row">
              <span className="venue-booking-label">Manager</span>
              <span className="venue-booking-value">{venue.managed_by}</span>
            </div>
          )}
        </div>
      </div>

      {venue.notes && !venue.cssa_recommended && (
        <div className="venue-detail-section">
          <h4>Notes</h4>
          <p className="venue-detail-notes">{venue.notes}</p>
        </div>
      )}

      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="venue-book-btn"
        >
          Book Now
          <ChevronRight />
        </a>
      )}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg className="icon" width={16} height={16} viewBox="0 0 24 24" style={{ marginLeft: 4 }}>
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}
