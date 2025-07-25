import { Component, computed, inject, signal, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VehicleService } from '../../services/vehicle';
import { Vehicle } from '../../models';

@Component({
  selector: 'app-vehicle-list',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleListComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Signals for state management
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly sortField = signal<keyof Vehicle>('make');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Computed filtered and sorted vehicles
  protected readonly filteredVehicles = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const vehicles = this.vehicles();
    
    let filtered = vehicles.filter(vehicle => 
      vehicle.make.toLowerCase().includes(search) ||
      vehicle.model.toLowerCase().includes(search) ||
      vehicle.colour.toLowerCase().includes(search) ||
      vehicle.year.toString().includes(search)
    );

    // Sort vehicles
    const field = this.sortField();
    const direction = this.sortDirection();
    
    return filtered.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return direction === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return direction === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });
  });

  protected readonly sortOptions = [
    { value: 'make', label: 'Make' },
    { value: 'model', label: 'Model' },
    { value: 'year', label: 'Year' },
    { value: 'price', label: 'Price' },
    { value: 'mileage', label: 'Mileage' }
  ] as const;

  ngOnInit(): void {
    this.loadVehicles();
  }

  private loadVehicles(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.vehicleService.getVehicles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vehicles) => {
          this.vehicles.set(vehicles);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load vehicles. Please try again.');
          this.loading.set(false);
          console.error('Error loading vehicles:', err);
        }
      });
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onSortChange(field: keyof Vehicle): void {
    if (this.sortField() === field) {
      // Toggle direction if same field
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  protected viewVehicleDetails(vehicleId: string): void {
    this.router.navigate(['/vehicle', vehicleId]);
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price);
  }

  protected retry(): void {
    this.loadVehicles();
  }
} 