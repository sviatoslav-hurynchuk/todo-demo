import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskQueryParams } from '../models/task.model';
import { PagedResult } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getAll(queryParams?: TaskQueryParams): Observable<PagedResult<Task>> {
    let params = new HttpParams();

    if (queryParams) {
      if (queryParams.page !== undefined) params = params.set('page', queryParams.page.toString());
      if (queryParams.pageSize !== undefined) params = params.set('pageSize', queryParams.pageSize.toString());
      if (queryParams.search) params = params.set('search', queryParams.search);
      if (queryParams.isCompleted !== undefined) params = params.set('isCompleted', queryParams.isCompleted.toString());
      if (queryParams.isImportant !== undefined) params = params.set('isImportant', queryParams.isImportant.toString());
      if (queryParams.categoryId !== undefined) params = params.set('categoryId', queryParams.categoryId.toString());
    }

    return this.http.get<PagedResult<Task>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleComplete(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/toggle`, {});
  }
}
