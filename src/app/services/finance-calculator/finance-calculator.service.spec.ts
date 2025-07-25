import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { FinanceCalculatorService } from './finance-calculator.service';
import { Vehicle, FinanceQuote } from '../../models';

describe('FinanceCalculatorService', () => {
  let service: FinanceCalculatorService;

  const mockVehicle: Vehicle = {
    id: 'veh001',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    price: 25000,
    mileage: 15000,
    colour: 'White'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceCalculatorService);
  });

  describe('Given FinanceCalculatorService is initialized', () => {
    describe('When calculateFinance is called', () => {
      it('Then should return correct finance quote with standard terms', fakeAsync(() => {
        // Arrange
        const termInMonths = 60;
        const deposit = 2500;
        let result: FinanceQuote | undefined;

        // Act
        service.calculateFinance(mockVehicle, termInMonths, deposit).subscribe((quote: FinanceQuote) => {
          result = quote;
        });
        tick(300);

        // Assert
        expect(result).toBeDefined();
        expect(result?.onTheRoadPrice).toBe(25000);
        expect(result?.totalDeposit).toBe(2500);
        expect(result?.totalAmountOfCredit).toBe(22500);
        expect(result?.numberOfMonthlyPayments).toBe(60);
        expect(result?.monthlyPayment).toBeGreaterThan(0);
      }));

      it('Then should handle zero deposit correctly', fakeAsync(() => {
        // Arrange
        const termInMonths = 48;
        const deposit = 0;
        let result: FinanceQuote | undefined;

        // Act
        service.calculateFinance(mockVehicle, termInMonths, deposit).subscribe((quote: FinanceQuote) => {
          result = quote;
        });
        tick(300);

        // Assert
        expect(result?.totalDeposit).toBe(0);
        expect(result?.totalAmountOfCredit).toBe(25000);
        expect(result?.monthlyPayment).toBeGreaterThan(0);
      }));

      it('Then should handle deposit larger than vehicle price', fakeAsync(() => {
        // Arrange
        const termInMonths = 36;
        const deposit = 30000; // More than vehicle price
        let result: FinanceQuote | undefined;

        // Act
        service.calculateFinance(mockVehicle, termInMonths, deposit).subscribe((quote: FinanceQuote) => {
          result = quote;
        });
        tick(300);

        // Assert
        expect(result?.totalDeposit).toBe(25000); // Capped at vehicle price
        expect(result?.totalAmountOfCredit).toBe(0);
        expect(result?.monthlyPayment).toBe(0);
      }));
    });
  });
}); 