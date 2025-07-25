import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FinanceQuoteComponent } from './finance-quote.component';
import { FinanceQuote } from '../../models';

describe('FinanceQuoteComponent', () => {
  let component: FinanceQuoteComponent;
  let fixture: ComponentFixture<FinanceQuoteComponent>;

  const mockFinanceQuote: FinanceQuote = {
    onTheRoadPrice: 25000,
    totalDeposit: 2500,
    totalAmountOfCredit: 22500,
    numberOfMonthlyPayments: 60,
    monthlyPayment: 425.32
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceQuoteComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Given FinanceQuoteComponent is initialized', () => {
    describe('When component loads', () => {
      it('Then should create component', () => {
        expect(component).toBeTruthy();
      });
    });

    describe('When finance quote is provided', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('financeQuote', mockFinanceQuote);
        fixture.detectChanges();
      });

      it('Then should display quote details', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.quote-details')).toBeTruthy();
      });

      it('Then should show monthly payment', () => {
        const compiled = fixture.nativeElement;
        const monthlyPayment = compiled.querySelector('.monthly-payment');
        expect(monthlyPayment?.textContent).toContain('£425.32');
      });
    });

    describe('When calculating', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('isCalculating', true);
        fixture.detectChanges();
      });

      it('Then should show calculating spinner', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.calculating mat-progress-spinner')).toBeTruthy();
      });
    });

    describe('When formatting prices', () => {
      it('Then should format price in GBP', () => {
        const formattedPrice = component['formatPrice'](25000);
        expect(formattedPrice).toContain('£');
        expect(formattedPrice).toContain('25,000');
      });

      it('Then should format monthly payment with decimals', () => {
        const formattedPayment = component['formatMonthlyPayment'](425.32);
        expect(formattedPayment).toContain('£');
        expect(formattedPayment).toContain('425.32');
      });
    });
  });
}); 