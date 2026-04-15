// Mapping of venue IDs to their photo URLs (static assets)
export const VENUE_PHOTOS: Record<string, string[]> = {
  // --- PRICE: Ballrooms & Event Spaces ---
  "ballroom-east": [
    "./venue-images/rooms/ballroom-east.jpg",
    "./venue-images/rooms/ballroom-east-1.jpg",
    "./venue-images/rooms/ballroom-east-2.jpg",
    "./venue-images/rooms/ballroom-east-3.jpg",
  ],
  "ballroom-west-a": ["./venue-images/rooms/ballroom-west-a.jpg"],
  "ballroom-west-b": ["./venue-images/rooms/ballroom-west-b.jpg"],
  "ballroom-west-ab": ["./venue-images/rooms/ballroom-west-ab.jpg"],
  "theater": ["./venue-images/rooms/theater.jpg"],
  "the-forum": ["./venue-images/rooms/the-forum.jpg"],
  "dance-studio": ["./venue-images/rooms/dance-studio.jpg"],
  "the-loft": [],

  // --- PRICE: Meeting Rooms ---
  "john-muir-college-room": ["./venue-images/rooms/muir-college-room.jpg"],
  "bear-room": ["./venue-images/rooms/bear-room.jpg"],
  "red-shoe-room": ["./venue-images/rooms/red-shoe-room.jpg"],
  "roosevelt-college-room": ["./venue-images/rooms/roosevelt-college-room.jpg"],
  "marshall-college-room": ["./venue-images/rooms/marshall-college-room.jpg"],
  "warren-college-room": ["./venue-images/rooms/warren-college-room.jpg"],
  "green-table-room": ["./venue-images/rooms/green-table-room.jpg"],
  "governance-chambers": ["./venue-images/rooms/governance-chambers.jpg"],
  "sixth-college-room": ["./venue-images/rooms/sixth-college-room.jpg"],
  "revelle-college-room": ["./venue-images/rooms/revelle-college-room.jpg"],

  // --- PRICE: Outdoor ---
  "price-center-plaza": [
    "./venue-images/rooms/plaza-1.jpg",
    "./venue-images/rooms/plaza-2.jpg",
    "./venue-images/rooms/plaza-3.jpg",
  ],

  // --- Student Center (STCTR) ---
  "dolores-huerta-philip-vera-cruz-room": ["./venue-images/rooms/dolores-huerta-room.jpg"],
  "thich-nhat-hanh-room": ["./venue-images/rooms/thich-nhat-hanh-room.jpg"],
  "stage-room-patio": ["./venue-images/rooms/stage-room.jpg"],

  // --- Outdoor / Library Walk (LIBWK) ---
  "matthews-quad": ["./venue-images/rooms/matthews-quad.jpg"],
  "town-square": ["./venue-images/rooms/town-square.jpg"],

  // --- Epstein Amphitheatre ---
  "epstein-family-amphitheatre": ["./venue-images/rooms/epstein-amphitheatre.jpg"],

  // --- SSC ---
  "ssc-conference-rooms-260-300-350-400-450-554-554a": ["./venue-images/rooms/conference-room-300.jpg"],

  // --- Music / Concert Halls ---
  "mandeville-auditorium": ["./venue-images/rooms/mandeville-auditorium.jpg"],

  // --- Theatre & Dance ---
  "mandell-weiss-forum": ["./venue-images/rooms/mandell-weiss-forum.jpg"],
  "mandell-weiss-theatre": ["./venue-images/rooms/mandell-weiss-theatre.jpg"],
  "sheila-hughes-potiker-theatre": ["./venue-images/rooms/potiker-theatre.jpg"],
  "arthur-wagner-theatre": ["./venue-images/rooms/wagner-theatre.jpg"],
  "theodore-adele-shank-theatre": ["./venue-images/rooms/shank-theatre.jpg"],

  // --- Recreation ---
  "liontree-arena": ["./venue-images/rooms/liontree-arena.jpg"],

  // --- Other Buildings ---
  "design-innovation-building-dib": ["./venue-images/rooms/dib.jpg"],
  "the-great-hall-international-house": [
    "./venue-images/rooms/great-hall.jpg",
    "./venue-images/rooms/great-hall-exterior.jpg",
  ],
};

export function getVenuePhoto(venueId: string): string | undefined {
  const photos = VENUE_PHOTOS[venueId];
  if (!photos || photos.length === 0) return undefined;
  return photos[0];
}

export function getVenuePhotos(venueId: string): string[] {
  return VENUE_PHOTOS[venueId] ?? [];
}
