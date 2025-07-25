import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly http = inject(HttpClient);

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>('/data/vehicles.json');
  }

  getVehicleById(id: string): Observable<Vehicle | undefined> {
    return this.http.get<Vehicle[]>('/data/vehicles.json').pipe(
      map(vehicles => vehicles.find(v => v.id === id))
    );
  }
} 