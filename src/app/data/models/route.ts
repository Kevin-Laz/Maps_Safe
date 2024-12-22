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

