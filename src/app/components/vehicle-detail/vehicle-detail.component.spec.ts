import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VehicleDetailComponent } from './vehicle-detail.component';
import { VehicleService } from '../../services/vehicle';
import { FinanceCalculatorService } from '../../services/finance-calculator';
import { Vehicle, FinanceQuote } from '../../models';

describe('VehicleDetailComponent', () => {
  let component: VehicleDetailComponent;
  let fixture: ComponentFixture<VehicleDetailComponent>;
  let mockVehicleService: jasmine.SpyObj<VehicleService>;
  let mockFinanceService: jasmine.SpyObj<FinanceCalculatorService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockVehicle: Vehicle = {
    id: 'veh001',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    price: 25000,
    mileage: 15000,
    colour: 'White'
  };

  const mockFinanceQuote: FinanceQuote = {
    onTheRoadPrice: 25000,
    totalDeposit: 2500,
    totalAmountOfCredit: 22500,
    numberOfMonthlyPayments: 60,
    monthlyPayment: 425.32
  };

  beforeEach(async () => {
    const vehicleServiceSpy = jasmine.createSpyObj('VehicleService', ['getVehicleById']);
    const financeServiceSpy = jasmine.createSpyObj('FinanceCalculatorService', ['calculateFinance']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      params: of({ id: 'veh001' })
    };

    await TestBed.configureTestingModule({
      imports: [VehicleDetailComponent, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: FinanceCalculatorService, useValue: financeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleDetailComponent);
    component = fixture.componentInstance;
    mockVehicleService = TestBed.inject(VehicleService) as jasmine.SpyObj<VehicleService>;
    mockFinanceService = TestBed.inject(FinanceCalculatorService) as jasmine.SpyObj<FinanceCalculatorService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Given VehicleDetailComponent is initialized', () => {
    describe('When vehicle loads successfully', () => {
      beforeEach(() => {
        mockVehicleService.getVehicleById.and.returnValue(of(mockVehicle));
        mockFinanceService.calculateFinance.and.returnValue(of(mockFinanceQuote));
      });

      it('Then should create component', () => {
        expect(component).toBeTruthy();
      });

      it('Then should load vehicle and setup default finance', () => {
        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(mockVehicleService.getVehicleById).toHaveBeenCalledWith('veh001');
        expect(component['vehicle']()).toEqual(mockVehicle);
        expect(component['loading']()).toBeFalse();
        expect(component['error']()).toBeNull();
        expect(mockFinanceService.calculateFinance).toHaveBeenCalled();
      });

      it('Then should calculate default deposit as 10% of vehicle price', () => {
        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        const expectedDeposit = Math.round(mockVehicle.price * 0.1);
        expect(component['defaultDeposit']()).toBe(expectedDeposit);
      });
    });

    describe('When vehicle is not found', () => {
      it('Then should show error message', () => {
        // Arrange
        mockVehicleService.getVehicleById.and.returnValue(of(undefined));

        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(component['error']()).toBe('Vehicle not found');
        expect(component['loading']()).toBeFalse();
      });
    });

    describe('When service call fails', () => {
      it('Then should handle error gracefully', () => {
        // Arrange
        mockVehicleService.getVehicleById.and.returnValue(throwError(() => new Error('API Error')));

        // Act
        component.ngOnInit();
        fixture.detectChanges();

        // Assert
        expect(component['loading']()).toBeFalse();
        expect(component['error']()).toBe('Failed to load vehicle details. Please try again.');
      });
    });

    describe('When user interactions occur', () => {
      beforeEach(() => {
        mockVehicleService.getVehicleById.and.returnValue(of(mockVehicle));
        mockFinanceService.calculateFinance.and.returnValue(of(mockFinanceQuote));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('Then should navigate back when goBack is called', () => {
        // Act
        component['goBack']();

        // Assert
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vehicles']);
      });

      it('Then should recalculate finance when deposit changes', () => {
        // Arrange
        mockFinanceService.calculateFinance.calls.reset();

        // Act
        component['onDepositChange'](5000);

        // Assert
        expect(component['financeForm'].get('deposit')?.value).toBe(5000);
        expect(mockFinanceService.calculateFinance).toHaveBeenCalledWith(mockVehicle, 60, 5000);
      });

      it('Then should recalculate finance when term changes', () => {
        // Arrange
        mockFinanceService.calculateFinance.calls.reset();

        // Act
        component['onTermChange'](48);

        // Assert
        expect(component['financeForm'].get('termInMonths')?.value).toBe(48);
        expect(mockFinanceService.calculateFinance).toHaveBeenCalledWith(mockVehicle, 48, jasmine.any(Number));
      });
    });
  });
}); 