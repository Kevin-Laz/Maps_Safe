export interface RouteComplete{
  origin: string;
  destination: string;
  duration: string;
  safe: number;
  oLatLng: google.maps.LatLngLiteral | null;
  dLatLng: google.maps.LatLngLiteral | null;
};
export interface RouteCoordinatesNames{
  oLatLng: google.maps.LatLngLiteral | null;
  dLatLng: google.maps.LatLngLiteral | null;
  origin: string;
  destination: string;
}

export interface Coordinate{
  lat: number,
  lng: number
}

export interface RouteSafe{
  waypoints: [number, number][],
  total_risk: number,
  security_level : number
}
export interface SafeRouteRequest{
  origin: [number, number];
  destination: [number, number]
}
