import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/vehicles', 
    pathMatch: 'full' 
  },
  { 
    path: 'vehicles', 
    loadComponent: () => import('./components/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent),
    title: 'Vehicle Inventory'
  },
  { 
    path: 'vehicle/:id', 
    loadComponent: () => import('./components/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
    title: 'Vehicle Details'
  },
  { 
    path: '**', 
    redirectTo: '/vehicles' 
  }
];
