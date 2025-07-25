import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VehicleService } from './vehicle.service';
import { Vehicle } from '../../models';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  const mockVehicles: Vehicle[] = [
    {
      make: "Toyota",
      model: "Camry",
      year: 2021,
      price: 23450,
      mileage: 15000,
      colour: "White",
      id: "veh001"
    },
    {
      make: "Honda",
      model: "Civic",
      year: 2020,
      price: 19800,
      mileage: 22000,
      colour: "Blue",
      id: "veh002"
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VehicleService]
    });
    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Given VehicleService is initialized', () => {
    describe('When getVehicles is called', () => {
      it('Then should return all vehicles from HTTP call', () => {
        // Arrange & Act
        service.getVehicles().subscribe((vehicles: Vehicle[]) => {
          // Assert
          expect(vehicles).toEqual(mockVehicles);
          expect(vehicles.length).toBe(2);
        });

        // Assert HTTP request
        const req = httpMock.expectOne('/data/vehicles.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockVehicles);
      });
    });

    describe('When getVehicleById is called', () => {
      it('Then should return the correct vehicle when ID exists', () => {
        // Arrange
        const vehicleId = 'veh001';

        // Act
        service.getVehicleById(vehicleId).subscribe((vehicle: Vehicle | undefined) => {
          // Assert
          expect(vehicle).toEqual(mockVehicles[0]);
          expect(vehicle?.id).toBe(vehicleId);
        });

        // Assert HTTP request
        const req = httpMock.expectOne('/data/vehicles.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockVehicles);
      });

      it('Then should return undefined when ID does not exist', () => {
        // Arrange
        const vehicleId = 'nonexistent';

        // Act
        service.getVehicleById(vehicleId).subscribe((vehicle: Vehicle | undefined) => {
          // Assert
          expect(vehicle).toBeUndefined();
        });

        // Assert HTTP request
        const req = httpMock.expectOne('/data/vehicles.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockVehicles);
      });
    });
  });
}); 