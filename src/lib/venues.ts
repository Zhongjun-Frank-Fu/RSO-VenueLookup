import venueData from "./venues.json";

export type VenueCapacity = {
  theater?: number;
  banquet?: number;
  classroom?: number;
  reception?: number;
  boardroom?: number;
  circle?: number;
  u_shape?: number;
  hollow_square?: number;
  max?: number;
};

export type VenueRates = {
  rso: string;
  department: string;
  external: string;
};

export type VenueSpace = {
  id: string;
  name: string;
  category: string;
  description: string;
  system: string;
  location: string;
  area_sqft: number | null;
  capacity: VenueCapacity;
  max_capacity: number | null;
  type: string;
  rates: VenueRates;
  rso_free: boolean;
  managed_by: string;
  equipment: string[];
  booking_method: string;
  contact: string;
  notes: string;
  tags: string[];
  cssa_recommended: boolean;
};

export type BuildingVenues = {
  spaces: VenueSpace[];
};

export type BookingSystem = {
  id: string;
  name: string;
  short_name: string;
  color: string;
  scope: string;
  method: string;
  contact: string;
  timeline: string;
  applicable_to: string;
  rate_overview: string;
  notes: string;
};

export type CssaRecommendation = {
  activity_type: string;
  activity_type_en: string;
  capacity_range: string;
  venue_ids: string[];
  advance_booking: string;
  notes: string;
};

export type VenueData = {
  venues: Record<string, BuildingVenues>;
  booking_systems: BookingSystem[];
  cssa_recommendations: CssaRecommendation[];
  category_order: string[];
  meta: {
    version: string;
    last_updated: string;
    total_venues: number;
    total_buildings: number;
    source: string;
  };
};

export const venues: VenueData = venueData as unknown as VenueData;

export const SYSTEM_COLORS: Record<string, string> = {
  "university-centers": "#2563EB",
  classroom: "#6B7280",
  independent: "#8B0000",
  hcs: "#7C3AED",
  recreation: "#059669",
  "theatre-dance": "#EA580C",
  unknown: "#9CA3AF",
};

export function getSystemColor(systemId: string): string {
  return SYSTEM_COLORS[systemId] ?? SYSTEM_COLORS.unknown;
}

export function getVenuesForBuilding(
  buildingCode: string
): VenueSpace[] | null {
  const building = venues.venues[buildingCode];
  return building ? building.spaces : null;
}

export function getAllVenues(): VenueSpace[] {
  return Object.values(venues.venues).flatMap((b) => b.spaces);
}

export function getVenueBuildingCode(venueId: string): string | null {
  for (const [code, building] of Object.entries(venues.venues)) {
    if (building.spaces.some((s) => s.id === venueId)) {
      return code;
    }
  }
  return null;
}

export function getBuildingVenueCount(buildingCode: string): number {
  return venues.venues[buildingCode]?.spaces.length ?? 0;
}

export function hasVenues(buildingCode: string): boolean {
  return buildingCode in venues.venues;
}
