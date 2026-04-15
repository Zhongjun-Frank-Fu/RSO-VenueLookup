import { ClassroomSpace, getRoomTypeColor, getBookingSystem, getBookingChannelColor } from "../../lib/classrooms";
import {
  PeopleIcon,
  AreaIcon,
  ChevronRightIcon,
} from "../icons/VenueIcons";

type ClassroomCardProps = {
  classroom: ClassroomSpace;
  onClick: () => void;
};

function FloorIcon({ size = 12 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
    </svg>
  );
}

function SeatIcon({ size = 12 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 18v3h3v-3h10v3h3v-6H4v3zm15-8h3v3h-3V10zM2 10h3v3H2v-3zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z" />
    </svg>
  );
}

export function ClassroomCard({ classroom, onClick }: ClassroomCardProps) {
  const typeColor = getRoomTypeColor(classroom.room_type);
  const bookingSystem = getBookingSystem(classroom.booking_channel);
  const bookingColor = getBookingChannelColor(classroom.booking_channel);

  return (
    <button
      className="venue-card"
      style={{ borderLeftColor: typeColor }}
      onClick={onClick}
    >
      <div className="venue-card-header">
        <h3 className="venue-card-name">
          {classroom.room_type === "阶梯教室" || classroom.room_type === "集会厅"
            ? classroom.registrar_code
            : `${classroom.room} 教室`}
        </h3>
        <span className="venue-card-arrow">
          <ChevronRightIcon size={18} />
        </span>
      </div>

      <div className="venue-card-info-row">
        {classroom.floor != null && (
          <span className="venue-card-info-item">
            <FloorIcon size={12} />
            {classroom.floor}楼
          </span>
        )}
        {classroom.area_sqft != null && (
          <span className="venue-card-info-item">
            <AreaIcon size={12} />
            {classroom.area_sqft.toLocaleString()} sqft
          </span>
        )}
      </div>

      {classroom.capacity != null && (
        <div className="venue-card-capacity">
          <PeopleIcon size={14} />
          <span className="venue-cap-badge">{classroom.capacity}</span>
          <span className="venue-cap-detail">
            <SeatIcon size={12} /> {classroom.seating_type}
          </span>
        </div>
      )}

      {/* Room type + key features */}
      <div className="venue-card-tags">
        <span
          className="venue-tag"
          style={{ backgroundColor: typeColor, color: "#fff", borderColor: typeColor }}
        >
          {classroom.room_type}
        </span>
        {classroom.features.slice(0, 3).map((f) => (
          <span key={f} className="venue-tag">{f}</span>
        ))}
        {classroom.features.length > 3 && (
          <span className="venue-tag venue-tag-more">
            +{classroom.features.length - 3}
          </span>
        )}
      </div>

      <div className="venue-card-footer">
        {/* Booking channel badge */}
        <div className="venue-card-badges">
          {bookingSystem && (
            <span
              className="venue-badge"
              style={{ backgroundColor: bookingColor + "18", color: bookingColor, borderColor: bookingColor + "40" }}
            >
              {bookingSystem.short_name}
            </span>
          )}
        </div>

        {/* Equipment preview */}
        {classroom.equipment.length > 0 && (
          <div className="venue-card-equipment">
            {classroom.equipment.slice(0, 3).map((eq) => (
              <span key={eq} className="venue-equip-tag">{eq}</span>
            ))}
            {classroom.equipment.length > 3 && (
              <span className="venue-equip-tag">
                +{classroom.equipment.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
