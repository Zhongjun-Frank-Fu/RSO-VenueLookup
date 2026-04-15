import { ClassroomSpace, getRoomTypeColor, getBookingSystem, getBookingChannelColor } from "../../lib/classrooms";
import {
  PeopleIcon,
  AreaIcon,
  EquipIcon,
  BookingIcon,
} from "../icons/VenueIcons";
import { BackIcon } from "../icons/BackIcon";

type ClassroomDetailProps = {
  classroom: ClassroomSpace;
  onClose: () => void;
};

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="venue-detail-section">
      <h4>
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="venue-booking-row">
      <span className="venue-booking-label">{label}</span>
      <span className="venue-booking-value"><AutoLink text={value} /></span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  if (value == null) return null;
  return (
    <div className="venue-booking-row">
      <span className="venue-booking-label">{label}</span>
      <span className="venue-booking-value">{value ? "是" : "否"}</span>
    </div>
  );
}

function LocationIcon({ size = 13 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function SeatIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 18v3h3v-3h10v3h3v-6H4v3zm15-8h3v3h-3V10zM2 10h3v3H2v-3zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z" />
    </svg>
  );
}

function BoardIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
    </svg>
  );
}

function EnvIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24">
      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
    </svg>
  );
}

function extractUrl(text: string): string | null {
  const full = text.match(/https?:\/\/[^\s,)]+/);
  if (full) return full[0];
  return null;
}

/** Renders text with auto-linked URLs and emails */
function AutoLink({ text }: { text: string }) {
  // Match URLs and email addresses
  const pattern = /(https?:\/\/[^\s,)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts: (string | { url: string; label: string })[] = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const value = match[1];
    if (value.includes("@")) {
      parts.push({ url: `mailto:${value}`, label: value });
    } else {
      // Show domain + path as label
      const label = value.replace(/^https?:\/\//, "");
      parts.push({ url: value, label });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  if (parts.length === 1 && typeof parts[0] === "string") {
    return <>{text}</>;
  }
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <a
            key={i}
            href={part.url}
            target={part.url.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="link"
            style={{ wordBreak: "break-all" }}
          >
            {part.label}
          </a>
        )
      )}
    </>
  );
}

export function ClassroomDetail({ classroom, onClose }: ClassroomDetailProps) {
  const typeColor = getRoomTypeColor(classroom.room_type);
  const bookingSystem = getBookingSystem(classroom.booking_channel);
  const bookingColor = getBookingChannelColor(classroom.booking_channel);
  const bookingUrl = bookingSystem ? extractUrl(bookingSystem.method) : null;

  return (
    <div className="venue-detail">
      <div
        className="venue-detail-header"
        style={{ borderBottomColor: typeColor }}
      >
        <div className="venue-detail-header-content">
          <button className="venue-detail-back" onClick={onClose}>
            <BackIcon />
            <span>返回</span>
          </button>
          <h3 className="venue-detail-name">{classroom.registrar_code}</h3>
          <div className="venue-detail-meta-row">
            <span className="venue-detail-meta-item">
              <LocationIcon size={13} />
              {classroom.building_name}, {classroom.floor ?? "?"}楼
            </span>
            {classroom.area_sqft != null && (
              <span className="venue-detail-meta-item">
                <AreaIcon size={13} />
                {classroom.area_sqft.toLocaleString()} sqft
              </span>
            )}
            {classroom.capacity != null && (
              <span className="venue-detail-meta-item">
                <PeopleIcon size={13} />
                容量 {classroom.capacity}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span
              className="venue-system-tag"
              style={{ backgroundColor: typeColor }}
            >
              {classroom.room_type}
            </span>
            {bookingSystem && (
              <span
                className="venue-system-tag"
                style={{ backgroundColor: bookingColor }}
              >
                {bookingSystem.short_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="基本信息">
        <div className="venue-detail-booking">
          <InfoRow label="房间类型" value={classroom.room_type} />
          <InfoRow label="座位类型" value={classroom.seating_type} />
          <InfoRow label="地板类型" value={classroom.floor_type} />
          <BoolRow label="教务处管控" value={classroom.controlled_by_registrar} />
          <BoolRow label="使用中" value={classroom.used} />
          <BoolRow label="可溢出" value={classroom.overflow_capable} />
        </div>
      </Section>

      {/* Accessibility */}
      <Section title="无障碍设施" icon={<SeatIcon size={14} />}>
        <div className="venue-detail-booking">
          <BoolRow label="无障碍通道" value={classroom.ada_accessible} />
          {classroom.wheelchair_spaces != null && (
            <InfoRow label="轮椅位数量" value={String(classroom.wheelchair_spaces)} />
          )}
        </div>
      </Section>

      {/* Presentation */}
      <Section title="演示设备" icon={<BoardIcon size={14} />}>
        <div className="venue-detail-booking">
          {classroom.boards && (
            <div className="venue-booking-row">
              <span className="venue-booking-label">黑板/白板</span>
              <span className="venue-booking-value" style={{ whiteSpace: "pre-line" }}>
                {classroom.boards}
              </span>
            </div>
          )}
          <BoolRow label="投影室" value={classroom.projection_booth} />
          <BoolRow label="板书+投影同时" value={classroom.simultaneous_board_projection} />
          <InfoRow label="讲台" value={classroom.lectern} />
          <InfoRow label="教师桌" value={classroom.instructor_tables} />
          <InfoRow label="媒体控制" value={classroom.media_control} />
        </div>
      </Section>

      {/* AV Equipment */}
      {classroom.equipment.length > 0 && (
        <Section title="影音设备" icon={<EquipIcon size={14} />}>
          <div className="venue-detail-equipment">
            {classroom.equipment.map((eq) => (
              <span key={eq} className="venue-equip-tag">{eq}</span>
            ))}
          </div>
          <div className="venue-detail-booking" style={{ marginTop: 8 }}>
            <BoolRow label="支持Zoom" value={classroom.zoom_capable} />
            <BoolRow label="可录播" value={classroom.podcasting} />
            <BoolRow label="i>clicker" value={classroom.iclicker} />
            <InfoRow label="辅助听力" value={classroom.assisted_listening} />
          </div>
        </Section>
      )}

      {/* Environment */}
      <Section title="教室环境" icon={<EnvIcon size={14} />}>
        <div className="venue-detail-booking">
          <InfoRow label="声学效果" value={classroom.acoustics?.replace(/\n/g, ", ")} />
          <InfoRow label="通风" value={classroom.ventilation} />
          {classroom.window_count != null && (
            <InfoRow label="窗户" value={classroom.window_count > 0 ? String(classroom.window_count) + " 扇" : "无"} />
          )}
          <InfoRow label="遮光性" value={classroom.windows_darkenability} />
          <InfoRow label="窗帘" value={classroom.window_coverings} />
          <InfoRow label="照明" value={classroom.lighting?.replace(/\n/g, ", ")} />
          <InfoRow label="时钟" value={classroom.clock} />
        </div>
      </Section>

      {/* Booking */}
      {bookingSystem && (
        <Section title="预约渠道" icon={<BookingIcon size={14} />}>
          <div className="venue-detail-booking">
            <div className="venue-booking-row">
              <span className="venue-booking-label">渠道</span>
              <span className="venue-booking-value">
                <span
                  className="venue-system-tag"
                  style={{ backgroundColor: bookingColor, fontSize: 11, padding: "2px 8px" }}
                >
                  {bookingSystem.short_name}
                </span>
                {" "}{bookingSystem.name}
              </span>
            </div>
            <div className="venue-booking-row">
              <span className="venue-booking-label">方式</span>
              <span className="venue-booking-value" style={{ whiteSpace: "pre-line" }}>
                <AutoLink text={bookingSystem.method} />
              </span>
            </div>
            <div className="venue-booking-row">
              <span className="venue-booking-label">联系方式</span>
              <span className="venue-booking-value" style={{ whiteSpace: "pre-line" }}>
                <AutoLink text={bookingSystem.contact} />
              </span>
            </div>
            <div className="venue-booking-row">
              <span className="venue-booking-label">流程</span>
              <span className="venue-booking-value" style={{ whiteSpace: "pre-line" }}>
                {bookingSystem.timeline}
              </span>
            </div>
            <div className="venue-booking-row">
              <span className="venue-booking-label">适用对象</span>
              <span className="venue-booking-value" style={{ whiteSpace: "pre-line" }}>
                {bookingSystem.applicable_to}
              </span>
            </div>
            <div className="venue-booking-row">
              <span className="venue-booking-label">费用</span>
              <span className="venue-booking-value">{bookingSystem.rate_overview}</span>
            </div>
            {bookingSystem.notes && (
              <div className="venue-booking-row">
                <span className="venue-booking-label">注意</span>
                <span className="venue-booking-value" style={{ whiteSpace: "pre-line" }}>
                  {bookingSystem.notes}
                </span>
              </div>
            )}
          </div>
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="venue-book-btn"
              style={{ marginTop: 12 }}
            >
              去预约
              <ChevronRight />
            </a>
          )}
        </Section>
      )}

      {/* Features summary */}
      {classroom.features.length > 0 && (
        <Section title="设施特征">
          <div className="venue-detail-equipment">
            {classroom.features.map((f) => (
              <span key={f} className="venue-equip-tag">{f}</span>
            ))}
          </div>
        </Section>
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
