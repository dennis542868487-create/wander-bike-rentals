export type MetroRouteDifficulty = "Easy" | "Moderate" | "Adventurous";

export type MetroRoute = {
  id: string;
  name: string;
  area: string;
  difficulty: MetroRouteDifficulty;
  distance: string;
  distanceBand: "Under 10 km" | "10–20 km" | "20–40 km" | "40 km +";
  terrain: string;
  summary: string;
  guideHref: string;
  guideLabel: string;
  sourceHref: string;
};

export const METRO_VANCOUVER_MAP_EMBED_URL =
  "https://www.google.com/maps/d/embed?mid=1Y40Y31SHzaLpNyBJbkKorJZHPwY";

export const METRO_VANCOUVER_MAP_VIEW_URL =
  "https://www.google.com/maps/d/viewer?mid=1Y40Y31SHzaLpNyBJbkKorJZHPwY";

export const METRO_VANCOUVER_ROUTES: MetroRoute[] = [
  {
    id: "false-creek",
    name: "False Creek + Granville Island",
    area: "Vancouver",
    difficulty: "Easy",
    distance: "10 km loop",
    distanceBand: "10–20 km",
    terrain: "Paved separated greenway",
    summary:
      "A relaxed waterfront loop with Olympic Village, Granville Island, markets, cafés, and frequent places to stop.",
    guideHref: "/guides/vancouver-bc-cycling-guide",
    guideLabel: "Vancouver cycling guide",
    sourceHref:
      "https://www.letsgobiking.net/beginner/68-false-creek-loop/",
  },
  {
    id: "seaside-beaches",
    name: "Seaside Beaches",
    area: "Vancouver",
    difficulty: "Easy",
    distance: "18 km return",
    distanceBand: "10–20 km",
    terrain: "Mostly paved, with some gravel",
    summary:
      "Follow Vancouver's shoreline from Granville Island past Kitsilano and Jericho toward Spanish Banks.",
    guideHref: "/guides/vancouver-bc-cycling-guide",
    guideLabel: "Vancouver cycling guide",
    sourceHref: "https://www.letsgobiking.net/beginner/seaside-beaches/",
  },
  {
    id: "the-drive",
    name: "The Drive",
    area: "Vancouver",
    difficulty: "Moderate",
    distance: "9–16 km",
    distanceBand: "10–20 km",
    terrain: "Bikeways and shared streets",
    summary:
      "Use the Adanac Bikeway to explore Commercial Drive, Strathcona, murals, cafés, and local shops.",
    guideHref: "/guides/vancouver-bc-cycling-guide",
    guideLabel: "Vancouver cycling guide",
    sourceHref: "https://www.letsgobiking.net/intermediate/114-the-drive/",
  },
  {
    id: "vancouver-steveston",
    name: "Vancouver to Steveston",
    area: "Vancouver + Richmond",
    difficulty: "Adventurous",
    distance: "44 km return",
    distanceBand: "40 km +",
    terrain: "Greenways, bikeways, and shared roads",
    summary:
      "Connect the Arbutus Greenway, Canada Line Bridge, Richmond paths, and Steveston's waterfront village.",
    guideHref: "/guides/richmond-bc-cycling-guide",
    guideLabel: "Richmond cycling guide",
    sourceHref:
      "https://www.letsgobiking.net/advanced/144-vancouver-to-steveston/",
  },
  {
    id: "willingdon-linear-park",
    name: "Willingdon Linear Park",
    area: "Burnaby",
    difficulty: "Easy",
    distance: "1.2 km one way",
    distanceBand: "Under 10 km",
    terrain: "Paved urban path",
    summary:
      "A compact, accessible greenway linking Brentwood, Hastings Street, pocket parks, public art, and local services.",
    guideHref: "/guides/burnaby-bc-cycling-guide",
    guideLabel: "Burnaby cycling guide",
    sourceHref:
      "https://www.letsgobiking.net/beginner/129-willingdon-linear-park/",
  },
  {
    id: "king-albert-greenway",
    name: "King Albert Greenway",
    area: "Coquitlam",
    difficulty: "Easy",
    distance: "Under 10 km",
    distanceBand: "Under 10 km",
    terrain: "Neighbourhood greenway",
    summary:
      "Cross Coquitlam between Blue Mountain Park and Mundy Park on an all-ages corridor linking parks and schools.",
    guideHref: "/guides/coquitlam-bc-cycling-guide",
    guideLabel: "Coquitlam cycling guide",
    sourceHref:
      "https://www.letsgobiking.net/beginner/king-albert-greenway/",
  },
  {
    id: "surrey-parks",
    name: "Surrey Parks Loop",
    area: "Surrey",
    difficulty: "Moderate",
    distance: "20 km loop",
    distanceBand: "20–40 km",
    terrain: "Greenways and quiet streets",
    summary:
      "Link Green Timbers, Bear Creek, Surrey Lake, and Fleetwood parks, with access from King George SkyTrain.",
    guideHref: "/guides/surrey-bc-cycling-guide",
    guideLabel: "Surrey cycling guide",
    sourceHref:
      "https://www.letsgobiking.net/intermediate/surrey-parks-loop-green-timbers-bear-creek-surrey-lake-fleetwood/",
  },
  {
    id: "barns-to-beaches",
    name: "Barns to Beaches",
    area: "Delta",
    difficulty: "Moderate",
    distance: "16 km",
    distanceBand: "10–20 km",
    terrain: "Dike trail and quiet rural roads",
    summary:
      "Ride between Ladner and Tsawwassen using the Boundary Bay Dike Trail, country roads, and city wayfinding.",
    guideHref: "/guides/delta-bc-cycling-guide",
    guideLabel: "Delta cycling guide",
    sourceHref:
      "https://www.delta.ca/parks-recreation/parks-trails/trails-cycling",
  },
];
