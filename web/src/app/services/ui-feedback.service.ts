import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface PromptOptions {
  title?: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ActiveConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface ActivePrompt extends PromptOptions {
  resolve: (value: string | null) => void;
}

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  private nextToastId = 1;

  readonly toasts = signal<ToastItem[]>([]);
  readonly activeConfirm = signal<ActiveConfirm | null>(null);
  readonly activePrompt = signal<ActivePrompt | null>(null);
  readonly promptInput = signal('');

  toast(message: string, type: ToastType = 'info', durationMs = 3800): void {
    const id = this.nextToastId++;
    this.toasts.update((list) => [...list, { id, message, type }]);
    if (durationMs > 0) {
      setTimeout(() => this.dismissToast(id), durationMs);
    }
  }

  dismissToast(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  confirm(options: ConfirmOptions | string): Promise<boolean> {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      this.activeConfirm.set({
        title: opts.title ?? 'Confirm Action',
        message: opts.message,
        confirmText: opts.confirmText ?? (opts.danger ? 'Delete' : 'Confirm'),
        cancelText: opts.cancelText ?? 'Cancel',
        danger: opts.danger ?? false,
        resolve,
      });
    });
  }

  resolveConfirm(result: boolean): void {
    const cur = this.activeConfirm();
    this.activeConfirm.set(null);
    cur?.resolve(result);
  }

  prompt(options: PromptOptions): Promise<string | null> {
    this.promptInput.set(options.defaultValue ?? '');
    return new Promise<string | null>((resolve) => {
      this.activePrompt.set({
        title: options.title ?? 'Input Required',
        message: options.message,
        defaultValue: options.defaultValue ?? '',
        placeholder: options.placeholder ?? '',
        confirmText: options.confirmText ?? 'Save',
        cancelText: options.cancelText ?? 'Cancel',
        resolve,
      });
    });
  }

  resolvePrompt(confirmed: boolean): void {
    const cur = this.activePrompt();
    const val = confirmed ? this.promptInput() : null;
    this.activePrompt.set(null);
    cur?.resolve(val);
  }
}
