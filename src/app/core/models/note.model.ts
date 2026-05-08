export interface Note {
  id: number;
  title: string;
  content: string;
  category?: string;
  isPinned: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotesResponse {
  items: Note[];
  total: number;
  page: number;
  limit: number;
}
