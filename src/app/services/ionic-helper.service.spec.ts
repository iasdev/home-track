import { TestBed } from '@angular/core/testing';

import { IonicHelperService } from './ionic-helper.service';

describe('IonicHelperService', () => {
  let service: IonicHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IonicHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
