import { TestBed } from '@angular/core/testing';

import { FilesystemWrapperService } from './filesystem-wrapper.service';

describe('FilesystemWrapperService', () => {
  let service: FilesystemWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilesystemWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
