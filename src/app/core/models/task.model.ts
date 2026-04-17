export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id?: string | number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  priority: TaskPriority;
  createdAt?: string;
  updatedAt?: string;
}
