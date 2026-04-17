import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueDateBadgeComponent } from './due-date-badge.component';

describe('DueDateBadgeComponent', () => {
  let component: DueDateBadgeComponent;
  let fixture: ComponentFixture<DueDateBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueDateBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueDateBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
