import { Component, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showCloseBtn: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() modalWidth: string = '600px';

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<void>();

  constructor(private eRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
  }

  ngOnDestroy() {
    // Ensure scrolling is restored if component is destroyed
    document.body.style.overflow = 'auto';
  }

  closeModal() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
    this.modalClosed.emit();
    document.body.style.overflow = 'auto';
  }

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.closeModal();
    }
  }

  // Allow clicking inside modal without triggering backdrop click
  onModalClick(event: Event) {
    event.stopPropagation();
  }
}
