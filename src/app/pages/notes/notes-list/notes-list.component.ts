import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotesService } from '../../../services/notes.service';
import { Note } from '../../../core/models/note.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './notes-list.component.html',
  styleUrls: [
    '../../task/task-list/task-list.component.css',
    './notes-list.component.css'
  ]
})
export class NotesListComponent implements OnInit {
  notes: Note[] = [];
  totalNotes = 0;
  pageSize = 10;
  currentPage = 1;
  keyword = '';
  category = '';
  sortOption = 'createdAt_desc';
  
  categories: string[] = ['Work', 'Personal', 'School', 'Health', 'Finance', 'Ideas', 'Other'];

  constructor(
    private notesService: NotesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    const [sortBy, sortOrder] = this.sortOption.split('_');
    this.notesService.getNotes(this.currentPage, this.pageSize, this.category, this.keyword, sortBy, sortOrder).subscribe({
      next: (response) => {
        this.notes = response.items;
        this.totalNotes = response.total;
      },
      error: (err) => console.error('Error loading notes', err)
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadNotes();
  }

  search(): void {
    this.currentPage = 1;
    this.loadNotes();
  }

  togglePin(note: Note): void {
    const updatedNote = { isPinned: !note.isPinned };
    this.notesService.updateNote(note.id, updatedNote).subscribe({
      next: () => {
        this.loadNotes();
      },
      error: (err) => console.error('Failed to toggle pin', err)
    });
  }

  createNote(): void {
    this.router.navigate(['/notes/new']);
  }

  editNote(id: number): void {
    this.router.navigate(['/notes/edit', id]);
  }

  deleteNote(id: number): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(id).subscribe({
        next: () => {
          this.loadNotes();
        },
        error: (err) => console.error('Error deleting note', err)
      });
    }
  }
}
