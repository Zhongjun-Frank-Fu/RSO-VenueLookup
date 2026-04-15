import { venues, getAllVenues } from "../../lib/venues";

export function VenueStats() {
  const allVenues = getAllVenues();
  const freeCount = allVenues.filter((v) => v.rso_free).length;
  const recommendedCount = allVenues.filter((v) => v.cssa_recommended).length;

  return (
    <div className="venue-stats">
      <div className="venue-stats-inner">
        <div className="venue-stat">
          <span className="venue-stat-number">
            {venues.meta.total_venues}
          </span>
          <span className="venue-stat-label">场地</span>
        </div>
        <div className="venue-stat">
          <span className="venue-stat-number">
            {venues.meta.total_buildings}
          </span>
          <span className="venue-stat-label">建筑</span>
        </div>
        <div className="venue-stat">
          <span className="venue-stat-number">{freeCount}</span>
          <span className="venue-stat-label">RSO 免费</span>
        </div>
        <div className="venue-stat">
          <span className="venue-stat-number">{recommendedCount}</span>
          <span className="venue-stat-label">CSSA 推荐</span>
        </div>
        <div className="venue-stat">
          <span className="venue-stat-number">
            {venues.booking_systems.length}
          </span>
          <span className="venue-stat-label">预约系统</span>
        </div>
      </div>
      <p className="venue-stats-footer">
        UCSD CSSA 场地预约指南 · 数据截至 {venues.meta.last_updated}
      </p>
    </div>
  );
}
