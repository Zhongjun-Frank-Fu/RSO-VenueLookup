import { useCallback } from "react";
import { BuildingDatum } from "../lib/buildings";
import { RoomMeeting } from "../lib/coursesToClassrooms";
import {
  PADDING,
  latLongToPixel,
  northeast,
  southwest,
} from "../lib/locations";
import { isMeetingOngoing, useMoment } from "../lib/moment-context";
import { Link } from "./Link";

type BuildingButtonProps = {
  building: BuildingDatum;
  rooms: RoomMeeting[][];
  selected: boolean;
  scrollTarget: { init: boolean } | null;
  visible: boolean;
  venueMode?: boolean;
  venueCount?: number;
  venueSystemId?: string;
  classroomMode?: boolean;
  classroomCount?: number;
  highlight?: boolean;
};

export function BuildingButton({
  building,
  rooms,
  selected,
  scrollTarget,
  visible,
  venueMode,
  venueCount,
  venueSystemId,
  classroomMode,
  classroomCount,
  highlight,
}: BuildingButtonProps) {
  const moment = useMoment();

  const college = building.college;

  const ref = useCallback(
    (button: HTMLAnchorElement | null) => {
      if (scrollTarget && button) {
        window.requestAnimationFrame(() => {
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const panelHeight = scrollTarget.init
            ? 0
            : windowHeight * (windowWidth <= 690 ? 0.7 : 0.6);
          const { left, top, width, height } = button.getBoundingClientRect();
          button.closest(".buildings")?.scrollBy({
            left: left + (-windowWidth + width) / 2,
            top: top + (-(windowHeight - panelHeight) + height) / 2,
            behavior: scrollTarget.init ? "auto" : "smooth",
          });
        });
      }
    },
    [scrollTarget]
  );

  const { x, y } = latLongToPixel(building.location);

  const systemClass = venueMode && venueSystemId
    ? `system-${venueSystemId}`
    : "";

  // Click same building again → close panel (toggle behavior)
  const targetView = selected
    ? { type: "default" as const }
    : { type: "building" as const, building: building.code };

  return (
    <Link
      view={targetView}
      className={`building-btn ${
        venueMode ? `venue-mode ${systemClass}` : classroomMode ? "classroom-mode" : `college-${college}`
      } ${selected ? "selected" : ""} ${
        highlight ? "highlight-pulse" : ""
      } ${visible ? "" : "building-btn-hidden"}`}
      style={{
        left: `${x - southwest.x + PADDING.horizontal}px`,
        top: `${y - northeast.y + PADDING.top}px`,
      }}
      elemRef={ref}
    >
      {building.code}
      {venueMode ? (
        <span className="venue-space-count">
          <span className="in-use">{venueCount ?? 0}</span>
        </span>
      ) : classroomMode ? (
        <span className="venue-space-count">
          <span className="in-use">{classroomCount ?? 0}</span>
        </span>
      ) : (
        <span className="room-count">
          {moment.type !== "term" ? (
            <>
              <span className="in-use">
                {
                  rooms.filter((meetings) =>
                    meetings.some((meeting) => isMeetingOngoing(meeting, moment))
                  ).length
                }
              </span>
              /{rooms.length}
            </>
          ) : (
            <span className="in-use">{rooms.length}</span>
          )}
        </span>
      )}
    </Link>
  );
}
