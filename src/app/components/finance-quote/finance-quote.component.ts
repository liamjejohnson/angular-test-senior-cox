import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FinanceQuote } from '../../models';

@Component({
  selector: 'app-finance-quote',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './finance-quote.component.html',
  styleUrls: ['./finance-quote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceQuoteComponent {
  // Inputs
  readonly financeQuote = input<FinanceQuote | null>(null);
  readonly isCalculating = input<boolean>(false);

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
} 