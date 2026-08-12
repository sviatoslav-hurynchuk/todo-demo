import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  showSuccess(message: string, durationMs = 3500): void {
    this.addToast('success', message, durationMs);
  }

  showError(message: string, durationMs = 4000): void {
    this.addToast('error', message, durationMs);
  }

  showInfo(message: string, durationMs = 3500): void {
    this.addToast('info', message, durationMs);
  }

  private addToast(type: ToastType, message: string, durationMs: number): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, message };

    this.toasts.update(list => [...list, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
