import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CarPark, CarParksResponse } from '../models/car-park';

const CAR_PARKS_API_URL = 'https://api.oulunliikenne.fi/proxy/graphql';

const GET_ALL_CAR_PARKS_QUERY = `
  query GetAllCarParks {
    carParks {
      carParkId
      name
      lat
      lon
      maxCapacity
      spacesAvailable
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CarParkService {
  private readonly http = inject(HttpClient);

  getCarParks(): Observable<CarPark[]> {
    return this.http
      .post<CarParksResponse>(CAR_PARKS_API_URL, {
        query: GET_ALL_CAR_PARKS_QUERY,
      })
      .pipe(
        map((response) =>
          [...(response.data?.carParks ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fi')),
        ),
      );
  }
}
