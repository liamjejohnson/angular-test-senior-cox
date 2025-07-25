import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Vehicle, FinanceQuote } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class FinanceCalculatorService {

  calculateFinance(vehicle: Vehicle, termInMonths: number, deposit: number): Observable<FinanceQuote> {
    const onTheRoadPrice = vehicle.price;
    const totalDeposit = Math.min(deposit, onTheRoadPrice);
    const totalAmountOfCredit = onTheRoadPrice - totalDeposit;
    const numberOfMonthlyPayments = termInMonths;
    
    // Simple interest calculation for demo purposes
    // In real world, this would use more complex APR calculations
    const annualInterestRate = 0.05; // 5% APR
    const monthlyInterestRate = annualInterestRate / 12;
    const monthlyPayment = totalAmountOfCredit > 0 
      ? (totalAmountOfCredit * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonthlyPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfMonthlyPayments) - 1)
      : 0;

    const quote: FinanceQuote = {
      onTheRoadPrice,
      totalDeposit,
      totalAmountOfCredit,
      numberOfMonthlyPayments,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100 // Round to 2 decimal places
    };

    // Simulate API delay
    return of(quote).pipe(delay(300));
  }
} 