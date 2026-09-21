import { Component } from '@angular/core';
import { CarParkMap } from './components/car-park-map/car-park-map';

@Component({
  selector: 'app-root',
  imports: [CarParkMap],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
