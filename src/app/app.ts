import { Component } from '@angular/core';
import { CarParkList } from './components/car-park-list/car-park-list';

@Component({
  selector: 'app-root',
  imports: [CarParkList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
