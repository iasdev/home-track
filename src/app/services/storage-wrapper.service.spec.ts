import { TestBed } from '@angular/core/testing';

import { StorageWrapperService } from './storage-wrapper.service';

describe('StorageWrapperService', () => {
  let service: StorageWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
