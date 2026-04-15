import classroomData from "./classrooms.json";

export type ClassroomSpace = {
  id: string;
  registrar_code: string;
  building_name: string;
  room: string;
  floor: number | null;
  area_sqft: number | null;
  capacity: number | null;
  room_type: string;
  controlled_by_registrar: boolean | null;
  used: boolean | null;
  overflow_capable: boolean | null;
  floor_type: string | null;
  seating_type: string;
  ada_accessible: boolean | null;
  projection_booth: boolean | null;
  boards: string | null;
  simultaneous_board_projection: boolean | null;
  acoustics: string | null;
  ventilation: string | null;
  window_count: number | null;
  has_windows: boolean;
  windows_darkenability: string | null;
  window_coverings: string | null;
  lighting: string | null;
  lectern: string | null;
  instructor_tables: string | null;
  clock: string | null;
  wheelchair_spaces: number | null;
  equipment: string[];
  media_control: string | null;
  zoom_capable: boolean | null;
  podcasting: boolean | null;
  iclicker: boolean | null;
  assisted_listening: string | null;
  features: string[];
  booking_channel: string;
};

export type BookingSystem = {
  id: string;
  name: string;
  short_name: string;
  color: string;
  method: string;
  contact: string;
  timeline: string;
  applicable_to: string;
  rate_overview: string;
  notes: string;
};

export type BuildingClassrooms = {
  spaces: ClassroomSpace[];
};

export type ClassroomData = {
  classrooms: Record<string, BuildingClassrooms>;
  booking_systems: BookingSystem[];
  room_types: string[];
  seating_types: string[];
  meta: {
    total_classrooms: number;
    total_buildings: number;
    source: string;
    last_updated: string;
  };
};

export const classrooms: ClassroomData =
  classroomData as unknown as ClassroomData;

export const ROOM_TYPE_COLORS: Record<string, string> = {
  "Lecture Hall": "#2563EB",
  Classroom: "#059669",
  "Conference Room": "#7C3AED",
  "Conference Room Service": "#7C3AED",
  "Class Laboratory": "#EA580C",
  Assembly: "#DC2626",
  "Scholarly Activity": "#6B7280",
  "Open Lab - Restricted": "#D97706",
  Unknown: "#9CA3AF",
};

export function getRoomTypeColor(roomType: string): string {
  return ROOM_TYPE_COLORS[roomType] ?? ROOM_TYPE_COLORS.Unknown;
}

export function getClassroomsForBuilding(
  buildingCode: string
): ClassroomSpace[] | null {
  const building = classrooms.classrooms[buildingCode];
  return building ? building.spaces : null;
}

export function getAllClassrooms(): ClassroomSpace[] {
  return Object.values(classrooms.classrooms).flatMap((b) => b.spaces);
}

export function getClassroomBuildingCode(
  classroomId: string
): string | null {
  for (const [code, building] of Object.entries(classrooms.classrooms)) {
    if (building.spaces.some((s) => s.id === classroomId)) {
      return code;
    }
  }
  return null;
}

export function getBuildingClassroomCount(buildingCode: string): number {
  return classrooms.classrooms[buildingCode]?.spaces.length ?? 0;
}

export function hasClassrooms(buildingCode: string): boolean {
  return buildingCode in classrooms.classrooms;
}

export const BOOKING_CHANNEL_COLORS: Record<string, string> = {
  registrar: "#2563EB",
  department: "#7C3AED",
  restricted: "#DC2626",
};

export function getBookingChannelColor(channelId: string): string {
  return BOOKING_CHANNEL_COLORS[channelId] ?? "#9CA3AF";
}

export function getBookingSystem(channelId: string): BookingSystem | undefined {
  return classrooms.booking_systems.find((s) => s.id === channelId);
}
