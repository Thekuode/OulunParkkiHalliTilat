export interface CarPark {
  carParkId: string;
  name: string;
  lat: number;
  lon: number;
  maxCapacity: number | null;
  spacesAvailable: number | null;
}

export interface CarParksResponse {
  data: {
    carParks: CarPark[];
  };
}

export function occupancyPercent(park: CarPark): number | null {
  if (park.maxCapacity == null || park.maxCapacity === 0 || park.spacesAvailable == null) {
    return null;
  }

  return Math.round(((park.maxCapacity - park.spacesAvailable) / park.maxCapacity) * 100);
}
