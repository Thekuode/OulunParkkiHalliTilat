import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CarParkService } from '../../services/car-park.service';
import { CarParkList } from './car-park-list';

describe('CarParkList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarParkList],
      providers: [
        {
          provide: CarParkService,
          useValue: {
            getCarParks: () =>
              of([
                {
                  carParkId: '6',
                  name: 'Kivisydän',
                  lat: 65.0148,
                  lon: 25.4659,
                  maxCapacity: 650,
                  spacesAvailable: 285,
                },
              ]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render a map for Oulu car parks', async () => {
    const fixture = TestBed.createComponent(CarParkList);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.map')).not.toBeNull();
  });
});
