import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FinanceCalculatorComponent, FinanceTerms } from './finance-calculator.component';
import { Vehicle } from '../../models';

describe('FinanceCalculatorComponent', () => {
  let component: FinanceCalculatorComponent;
  let fixture: ComponentFixture<FinanceCalculatorComponent>;

  const mockVehicle: Vehicle = {
    id: 'veh001',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    price: 25000,
    mileage: 15000,
    colour: 'White'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceCalculatorComponent, NoopAnimationsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceCalculatorComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('vehicle', mockVehicle);
    fixture.detectChanges();
  });

  describe('Given FinanceCalculatorComponent is initialized', () => {
    describe('When component loads', () => {
      it('Then should create component', () => {
        expect(component).toBeTruthy();
      });

      it('Then should calculate default deposit as 10% of vehicle price', () => {
        const expectedDeposit = Math.round(mockVehicle.price * 0.1);
        expect(component['defaultDeposit']()).toBe(expectedDeposit);
      });

      it('Then should set max deposit as vehicle price', () => {
        expect(component['maxDeposit']()).toBe(mockVehicle.price);
      });
    });

    describe('When form values change', () => {
      it('Then should emit terms when valid form values change', () => {
        // Arrange
        spyOn(component['termsChanged'], 'emit');

        // Act
        component['onDepositChange'](5000);

        // Assert
        expect(component['financeForm'].get('deposit')?.value).toBe(5000);
      });

      it('Then should emit terms when term changes', () => {
        // Arrange
        spyOn(component['termsChanged'], 'emit');

        // Act
        component['onTermChange'](48);

        // Assert
        expect(component['financeForm'].get('termInMonths')?.value).toBe(48);
      });
    });

    describe('When formatting prices', () => {
      it('Then should format price in GBP', () => {
        // Act
        const formattedPrice = component['formatPrice'](25000);

        // Assert
        expect(formattedPrice).toContain('£');
        expect(formattedPrice).toContain('25,000');
      });
    });
  });
}); 