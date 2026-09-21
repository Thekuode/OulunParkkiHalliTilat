import {
  afterRenderEffect,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { CarPark, occupancyPercent } from '../../models/car-park';
import { CarParkService } from '../../services/car-park.service';

const OULU_CENTER: L.LatLngExpression = [65.01236, 25.46816];
const OULU_ZOOM = 13;

@Component({
  selector: 'app-car-park-list',
  templateUrl: './car-park-list.html',
  styleUrl: './car-park-list.css',
})
export class CarParkList {
  private readonly carParkService = inject(CarParkService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapElement = viewChild<ElementRef<HTMLDivElement>>('map');

  private map?: L.Map;
  private markers?: L.FeatureGroup;
  private renderedParks?: CarPark[];

  protected readonly carParks = rxResource({
    stream: () => this.carParkService.getCarParks(),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.map?.remove();
      this.map = undefined;
      this.markers = undefined;
    });

    afterRenderEffect(() => {
      const container = this.mapElement()?.nativeElement;
      if (!container) {
        return;
      }

      this.map ??= this.createMap(container);

      const parks = this.carParks.value();
      if (this.map && parks && parks !== this.renderedParks) {
        this.renderedParks = parks;
        this.syncMarkers(parks);
      }
    });
  }

  private createMap(container: HTMLElement): L.Map | undefined {
    try {
      const map = L.map(container, { scrollWheelZoom: true }).setView(OULU_CENTER, OULU_ZOOM);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      this.markers = L.featureGroup().addTo(map);

      const observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container);
      this.destroyRef.onDestroy(() => observer.disconnect());

      return map;
    } catch {
      return undefined;
    }
  }

  private syncMarkers(parks: CarPark[]): void {
    if (!this.map || !this.markers) {
      return;
    }

    this.markers.clearLayers();

    const located = parks.filter(hasCoordinates);
    for (const park of located) {
      L.marker([park.lat, park.lon], {
        icon: markerIcon(park),
        riseOnHover: true,
      })
        .bindTooltip(popupContent(park), {
          className: 'park-tooltip',
          direction: 'top',
          offset: [0, -10],
          opacity: 1,
        })
        .bindPopup(popupContent(park))
        .on('add', (event) => {
          (event.target as L.Marker).getElement()?.setAttribute('aria-label', park.name);
        })
        .on('popupopen', (event) => {
          (event.target as L.Marker).closeTooltip();
        })
        .addTo(this.markers);
    }

    if (located.length > 0) {
      this.map.fitBounds(this.markers.getBounds().pad(0.2), { maxZoom: 14, animate: false });
    }

    this.map.invalidateSize();
  }
}

function hasCoordinates(park: CarPark): boolean {
  return Number.isFinite(park.lat) && Number.isFinite(park.lon);
}

function occupancyClass(park: CarPark): string {
  const percent = occupancyPercent(park);
  if (percent === null) {
    return 'unknown';
  }
  if (percent >= 81) {
    return 'high';
  }
  if (percent >= 51) {
    return 'medium';
  }
  return 'low';
}

function markerIcon(park: CarPark): L.DivIcon {
  return L.divIcon({
    className: `park-marker park-marker--${occupancyClass(park)}`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

function popupContent(park: CarPark): HTMLElement {
  const percent = occupancyPercent(park);
  const content = document.createElement('div');
  content.className = 'park-popup';

  const title = document.createElement('strong');
  title.textContent = park.name;
  content.append(title);

  const details = document.createElement('p');
  details.textContent = [
    `Vapaana: ${park.spacesAvailable ?? 'Ei tietoa'}`,
    `Kapasiteetti: ${park.maxCapacity ?? 'Ei tietoa'}`,
    `Täyttöaste: ${percent === null ? 'Ei tietoa' : `${percent} %`}`,
  ].join('\n');
  content.append(details);

  return content;
}
