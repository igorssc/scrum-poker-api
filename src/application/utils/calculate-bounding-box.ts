type CalculateBoundingBoxProps = {
  lat: number;
  lng: number;
  maxDistance: number;
};

export const calculateBoundingBox = ({
  lat,
  lng,
  maxDistance,
}: CalculateBoundingBoxProps) => {
  const radiusInKM = maxDistance / 1000;

  const DEGREES_TO_RADIANS = (degrees: number) => {
    return degrees * (Math.PI / 180);
  };

  const minLat = lat - radiusInKM / 111.12;
  const maxLat = lat + radiusInKM / 111.12;

  const minLon =
    lng - radiusInKM / Math.abs(Math.cos(DEGREES_TO_RADIANS(lng)) * 111.12);
  const maxLon =
    lng + radiusInKM / Math.abs(Math.cos(DEGREES_TO_RADIANS(lng)) * 111.12);

  return {
    minLat: minLat,
    maxLat: maxLat,
    minLng: minLon,
    maxLng: maxLon,
  };
};
