import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showCloseBtn: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() modalWidth: string = '600px';

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<void>();

  constructor(private eRef: ElementRef) {}

  closeModal() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
    this.modalClosed.emit();
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
