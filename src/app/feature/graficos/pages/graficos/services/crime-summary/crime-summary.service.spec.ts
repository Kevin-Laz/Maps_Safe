import { TestBed } from '@angular/core/testing';

import { CrimeSummaryService } from './crime-summary.service';

describe('CrimeSummaryService', () => {
  let service: CrimeSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrimeSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
