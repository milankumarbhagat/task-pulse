import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoToMp3Component } from './video-to-mp3.component';

describe('VideoToMp3Component', () => {
  let component: VideoToMp3Component;
  let fixture: ComponentFixture<VideoToMp3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoToMp3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoToMp3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
