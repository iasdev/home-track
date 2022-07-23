import { TestBed } from '@angular/core/testing';

import { LocalNotificationsWrapperService } from './local-notifications-wrapper.service';

describe('LocalNotificationsWrapperService', () => {
  let service: LocalNotificationsWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalNotificationsWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
