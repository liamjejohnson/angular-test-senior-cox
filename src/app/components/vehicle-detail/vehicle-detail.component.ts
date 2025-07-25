import { Component, computed, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { VehicleService } from '../../services/vehicle';
import { FinanceCalculatorService } from '../../services/finance-calculator';
import { Vehicle, FinanceQuote } from '../../models';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-vehicle-detail',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatToolbarModule
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
  private readonly fb = inject(FormBuilder);

  // Signals for state management
  protected readonly vehicle = signal<Vehicle | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly financeQuote = signal<FinanceQuote | null>(null);
  protected readonly calculatingFinance = signal(false);

  // Finance form
  protected readonly financeForm: FormGroup;

  // Computed values
  protected readonly defaultDeposit = computed(() => {
    const vehicle = this.vehicle();
    return vehicle ? Math.round(vehicle.price * 0.1) : 0;
  });

  protected readonly maxDeposit = computed(() => {
    const vehicle = this.vehicle();
    return vehicle ? vehicle.price : 100000;
  });

  constructor() {
    this.financeForm = this.fb.group({
      deposit: [0, [Validators.required, Validators.min(0)]],
      termInMonths: [60, [Validators.required, Validators.min(12), Validators.max(84)]]
    });
  }

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
        })
      )
      .subscribe({
        next: (vehicle) => {
          if (vehicle) {
            this.vehicle.set(vehicle);
            this.setupDefaultFinance(vehicle);
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

  private setupDefaultFinance(vehicle: Vehicle): void {
    const defaultDeposit = this.defaultDeposit();
    this.financeForm.patchValue({
      deposit: defaultDeposit,
      termInMonths: 60
    });
    
    // Set max validator for deposit
    this.financeForm.get('deposit')?.setValidators([
      Validators.required,
      Validators.min(0),
      Validators.max(vehicle.price)
    ]);
    
    this.calculateFinance();
  }

  protected calculateFinance(): void {
    const vehicle = this.vehicle();
    if (!vehicle || this.financeForm.invalid) return;

    this.calculatingFinance.set(true);
    const formValue = this.financeForm.value;

    this.financeService.calculateFinance(
      vehicle,
      formValue.termInMonths,
      formValue.deposit
    ).subscribe({
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

  protected onDepositChange(value: number): void {
    if (value !== this.financeForm.get('deposit')?.value) {
      this.financeForm.patchValue({ deposit: value });
      this.calculateFinance();
    }
  }

  protected onTermChange(value: number): void {
    if (value !== this.financeForm.get('termInMonths')?.value) {
      this.financeForm.patchValue({ termInMonths: value });
      this.calculateFinance();
    }
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

  protected formatMonthlyPayment(payment: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(payment);
  }

  protected retry(): void {
    this.ngOnInit();
  }
} 