import { Component, computed, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VehicleService } from '../../services/vehicle';
import { FinanceCalculatorService } from '../../services/finance-calculator';
import { Vehicle, FinanceQuote } from '../../models';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { FinanceCalculatorComponent, FinanceTerms } from '../finance-calculator/finance-calculator.component';
import { FinanceQuoteComponent } from '../finance-quote/finance-quote.component';

@Component({
  selector: 'app-vehicle-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    FinanceCalculatorComponent,
    FinanceQuoteComponent
  ],
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly financeService = inject(FinanceCalculatorService);

  // Signals for state management
  protected readonly vehicle = signal<Vehicle | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly financeQuote = signal<FinanceQuote | null>(null);
  protected readonly calculatingFinance = signal(false);

  // Current finance terms
  private currentTerms: FinanceTerms | null = null;

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap(params => {
          const vehicleId = params['id'];
          if (!vehicleId) {
            this.error.set('Vehicle ID not provided');
            return EMPTY;
          }
          return this.vehicleService.getVehicleById(vehicleId);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (vehicle) => {
          if (vehicle) {
            this.vehicle.set(vehicle);
            this.loading.set(false);
          } else {
            this.error.set('Vehicle not found');
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.error.set('Failed to load vehicle details. Please try again.');
          this.loading.set(false);
          console.error('Error loading vehicle:', err);
        }
      });
  }

  protected onFinanceTermsChanged(terms: FinanceTerms): void {
    this.currentTerms = terms;
    this.calculateFinance(terms);
  }

  private calculateFinance(terms: FinanceTerms): void {
    const vehicle = this.vehicle();
    if (!vehicle) return;

    this.calculatingFinance.set(true);

    this.financeService.calculateFinance(
      vehicle,
      terms.termInMonths,
      terms.deposit
    )
    .pipe(takeUntilDestroyed())
    .subscribe({
      next: (quote) => {
        this.financeQuote.set(quote);
        this.calculatingFinance.set(false);
      },
      error: (err) => {
        console.error('Error calculating finance:', err);
        this.calculatingFinance.set(false);
      }
    });
  }

  protected goBack(): void {
    this.router.navigate(['/vehicles']);
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price);
  }

  protected retry(): void {
    this.ngOnInit();
  }
} 