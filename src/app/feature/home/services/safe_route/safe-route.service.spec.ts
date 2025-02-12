import { TestBed } from '@angular/core/testing';

import { SafeRouteService } from './safe-route.service';

describe('SafeRouteService', () => {
  let service: SafeRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SafeRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
