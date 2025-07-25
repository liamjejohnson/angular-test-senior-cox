import { Component, computed, inject, signal, input, output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { Vehicle } from '../../models';

export interface FinanceTerms {
  deposit: number;
  termInMonths: number;
}

@Component({
  selector: 'app-finance-calculator',
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
    MatDividerModule
  ],
  templateUrl: './finance-calculator.component.html',
  styleUrls: ['./finance-calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceCalculatorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly vehicle = input.required<Vehicle>();
  readonly initialDeposit = input<number>(0);
  readonly initialTerm = input<number>(60);

  // Outputs
  readonly termsChanged = output<FinanceTerms>();

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
    this.setupForm();
  }

  private setupForm(): void {
    const vehicle = this.vehicle();
    if (!vehicle) return;

    const deposit = this.initialDeposit() || this.defaultDeposit();
    const term = this.initialTerm();

    this.financeForm.patchValue({
      deposit,
      termInMonths: term
    });

    // Set max validator for deposit
    this.financeForm.get('deposit')?.setValidators([
      Validators.required,
      Validators.min(0),
      Validators.max(vehicle.price)
    ]);

    // Emit initial values
    this.emitTerms();

    // Subscribe to form changes
    this.financeForm.valueChanges.subscribe(() => {
      if (this.financeForm.valid) {
        this.emitTerms();
      }
    });
  }

  private emitTerms(): void {
    const formValue = this.financeForm.value;
    this.termsChanged.emit({
      deposit: formValue.deposit,
      termInMonths: formValue.termInMonths
    });
  }

  protected onDepositChange(value: number): void {
    if (value !== this.financeForm.get('deposit')?.value) {
      this.financeForm.patchValue({ deposit: value });
    }
  }

  protected onTermChange(value: number): void {
    if (value !== this.financeForm.get('termInMonths')?.value) {
      this.financeForm.patchValue({ termInMonths: value });
    }
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price);
  }


} 