import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { redirectAuthGuard } from './redirect-auth.guard';

describe('redirectAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => redirectAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
