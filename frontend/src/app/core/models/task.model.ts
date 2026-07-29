export interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  isImportant: boolean;
  dueDate?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  categoryId?: number;
  isImportant?: boolean;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  isCompleted: boolean;
  isImportant: boolean;
  dueDate?: string;
  categoryId?: number;
}
