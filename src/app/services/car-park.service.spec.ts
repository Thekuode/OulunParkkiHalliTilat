import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CarParkService } from './car-park.service';

describe('CarParkService', () => {
  it('fetches and sorts car parks from GraphQL', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const service = TestBed.inject(CarParkService);
    const http = TestBed.inject(HttpTestingController);

    const resultPromise = new Promise((resolve) => {
      service.getCarParks().subscribe(resolve);
    });

    const request = http.expectOne('https://api.oulunliikenne.fi/proxy/graphql');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.query).toContain('carParks');

    request.flush({
      data: {
        carParks: [
          {
            carParkId: '3',
            name: 'Valkea',
            lat: 1,
            lon: 2,
            maxCapacity: 60,
            spacesAvailable: 12,
          },
          {
            carParkId: '1',
            name: 'Autosaari',
            lat: 3,
            lon: 4,
            maxCapacity: 286,
            spacesAvailable: 224,
          },
        ],
      },
    });

    const parks = (await resultPromise) as { name: string }[];
    expect(parks.map((park) => park.name)).toEqual(['Autosaari', 'Valkea']);
    http.verify();
  });
});
