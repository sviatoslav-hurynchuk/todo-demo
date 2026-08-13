export interface Task {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  isImportant: boolean;
  dueDate: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  categoryId?: number | null;
  isImportant?: boolean;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  isImportant: boolean;
  dueDate?: string | null;
  categoryId?: number | null;
}

export interface TaskQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isCompleted?: boolean;
  isImportant?: boolean;
  categoryId?: number;
}
