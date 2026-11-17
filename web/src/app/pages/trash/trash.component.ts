import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { I18nPipe } from '../../services/i18n.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { TrashItem } from '../../models/jira.models';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, I18nPipe],
  template: `
    <div class="trash-container">
      <!-- Toast Alert -->
      @if (toastMessage()) {
        <div class="toast-banner" [class.toast-error]="toastIsError()">
          <span>{{ toastMessage() }}</span>
          <button type="button" class="toast-close" (click)="toastMessage.set('')">&times;</button>
        </div>
      }

      <div class="trash-header">
        <div class="header-titles">
          <h2>🗑️ Trash Bin (Soft Delete &amp; Retention)</h2>
          <p class="subtitle">
            Items deleted by users are held here safely for a 30-day retention countdown before permanent purge.
            You can restore any item with its complete field values, attachments, links, and audit history.
          </p>
        </div>
        <div class="header-actions">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            (click)="loadTrash()"
            [disabled]="isLoading()"
          >
            🔄 Refresh
          </button>
          @if (trashItems().length > 0) {
            <button
              type="button"
              class="btn btn-danger btn-sm"
              (click)="purgeAll()"
              [disabled]="isPurging()"
            >
              ⚠️ Empty Trash (Purge All)
            </button>
          }
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="trash-stats-grid">
        <div class="stat-card">
          <span class="stat-label">Items In Trash</span>
          <span class="stat-value">{{ trashItems().length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Retention Policy</span>
          <span class="stat-value">30 Days</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Auto Purge Status</span>
          <span class="stat-value" style="color: #36b37e;">Active (Daily Clock)</span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="trash-filter-bar">
        <input
          type="text"
          class="form-control filter-input"
          placeholder="Filter by issue key, summary, or user..."
          [ngModel]="filterText()"
          (ngModelChange)="filterText.set($event)"
        />
        <span class="filter-count">
          Showing {{ filteredItems().length }} of {{ trashItems().length }} deleted items
        </span>
      </div>

      <!-- Content Table -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading Trash Bin items...</p>
        </div>
      } @else if (filteredItems().length === 0) {
        <app-empty-state
          icon="trash"
          title="Trash Bin is Empty"
          description="There are no soft-deleted issues matching your query."
          [actionLabel]="filterText() ? 'Clear Search' : ''"
          (action)="filterText.set('')"
        />
      } @else {
        <div class="table-card">
          <table class="trash-table">
            <thead>
              <tr>
                <th>{{ 'common.key' | i18n }}</th>
                <th>{{ 'common.type' | i18n }}</th>
                <th>Original Project</th>
                <th>{{ 'common.summary' | i18n }}</th>
                <th>Deleted By</th>
                <th>Deleted Date</th>
                <th>Retention Countdown</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredItems(); track item.id) {
                <tr class="trash-row">
                  <td>
                    <span class="issue-key-badge">{{ item.item_key }}</span>
                  </td>
                  <td>
                    <span class="item-type-pill">{{ item.item_type }}</span>
                  </td>
                  <td>
                    <span class="proj-badge">{{ item.project_key }}</span>
                  </td>
                  <td class="title-cell">
                    <strong>{{ item.title }}</strong>
                  </td>
                  <td>
                    <span class="user-badge">{{ item.deleted_by_name || 'System' }}</span>
                  </td>
                  <td class="date-cell">{{ item.deleted_at }}</td>
                  <td>
                    <span
                      class="days-badge"
                      [class.days-warn]="item.days_remaining <= 7"
                      [class.days-danger]="item.days_remaining <= 2"
                    >
                      ⏳ {{ item.days_remaining }} days left
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="btn btn-primary btn-xs"
                        (click)="restoreItem(item)"
                        title="Restore issue with complete field history"
                      >
                        ↩ Restore
                      </button>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs text-danger"
                        (click)="purgeItem(item)"
                        title="Permanently remove issue and delete blob files"
                      >
                        🗑 Purge
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .trash-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .toast-banner {
      background: #00875a;
      color: white;
      padding: 10px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
    .toast-error {
      background: #de350b;
    }
    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
    }
    .trash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .trash-header h2 {
      margin: 0 0 6px 0;
      font-size: 24px;
      color: var(--text-color, #172b4d);
    }
    .subtitle {
      margin: 0;
      font-size: 13px;
      color: var(--text-subtle, #6b778c);
      max-width: 800px;
    }
    .header-actions {
      display: flex;
      gap: 10px;
    }
    .trash-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--border-color, var(--border-color));
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-subtle, #6b778c);
    }
    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-color, #172b4d);
    }
    .trash-filter-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .filter-input {
      max-width: 360px;
      padding: 8px 12px;
      border: 1px solid var(--border-color, var(--border-color));
      border-radius: 4px;
      font-size: 13px;
      background: var(--input-bg, #ffffff);
      color: var(--text-color, #172b4d);
    }
    .filter-count {
      font-size: 12px;
      color: var(--text-subtle, #6b778c);
    }
    .table-card {
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--border-color, var(--border-color));
      border-radius: 8px;
      overflow-x: auto;
    }
    .trash-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .trash-table th {
      background: var(--table-th-bg, #fafbfc);
      padding: 12px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-subtle, #5e6c84);
      border-bottom: 2px solid var(--border-color, var(--border-color));
    }
    .trash-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-color, var(--border-color));
      vertical-align: middle;
      color: var(--text-color, #172b4d);
    }
    .trash-row:hover {
      background: var(--row-hover-bg, #f4f5f7);
    }
    .issue-key-badge {
      font-weight: 700;
      color: var(--brand-primary);
    }
    .item-type-pill {
      background: var(--badge-bg, #f4f5f7);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .proj-badge {
      background: var(--bg-subtle);
      color: var(--text-secondary);
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 700;
      font-size: 11px;
    }
    .days-badge {
      background: var(--success-bg);
      color: #006644;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .days-warn {
      background: var(--warning-bg);
      color: #ff8b00;
    }
    .days-danger {
      background: var(--danger-bg);
      color: var(--danger-color);
    }
    .action-buttons {
      display: inline-flex;
      gap: 8px;
    }
    .btn-xs {
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
      cursor: pointer;
    }
    .text-danger {
      color: var(--danger-color);
    }
    .text-danger:hover {
      background: var(--danger-bg);
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--border-color, var(--border-color));
      border-radius: 8px;
    }
    .empty-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #0052cc;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
})
export class TrashComponent implements OnInit {
  api = inject(ApiService);
  private ui = inject(UiFeedbackService);

  trashItems = signal<TrashItem[]>([]);
  isLoading = signal<boolean>(true);
  filterText = signal<string>('');
  toastMessage = signal<string>('');
  toastIsError = signal<boolean>(false);
  isPurging = signal<boolean>(false);

  filteredItems = computed(() => {
    const q = this.filterText().toLowerCase().trim();
    const items = this.trashItems();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.item_key.toLowerCase().includes(q) ||
        it.title.toLowerCase().includes(q) ||
        it.project_key.toLowerCase().includes(q) ||
        it.deleted_by_name.toLowerCase().includes(q) ||
        it.item_type.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.loadTrash();
  }

  async loadTrash(): Promise<void> {
    this.isLoading.set(true);
    try {
      const items = await this.api.getTrashItems();
      this.trashItems.set(items);
    } catch (err: any) {
      this.showToast(err.message || 'Failed to load Trash Bin', true);
    } finally {
      this.isLoading.set(false);
    }
  }

  async restoreItem(item: TrashItem): Promise<void> {
    try {
      const res = await this.api.restoreTrashItem(item.id);
      this.showToast(`Issue ${res.restored_key} was successfully restored from trash.`);
      await this.loadTrash();
    } catch (err: any) {
      this.showToast(err.message || 'Failed to restore item', true);
    }
  }

  async purgeItem(item: TrashItem): Promise<void> {
    if (!(await this.ui.confirm({ title: 'Permanently Delete Item', message: `Are you sure you want to permanently delete ${item.item_key}? This action cannot be undone.`, confirmText: 'Delete Forever', danger: true }))) {
      return;
    }
    try {
      await this.api.purgeTrashItem(item.id);
      this.showToast(`Issue ${item.item_key} permanently purged.`);
      await this.loadTrash();
    } catch (err: any) {
      this.showToast(err.message || 'Failed to purge item', true);
    }
  }

  async purgeAll(): Promise<void> {
    if (!(await this.ui.confirm({ title: 'Empty Trash Bin', message: `Are you sure you want to permanently empty all ${this.trashItems().length} items from the trash bin?`, confirmText: 'Empty Trash', danger: true }))) {
      return;
    }
    this.isPurging.set(true);
    try {
      const res = await this.api.purgeAllTrash();
      this.showToast(`Trash Bin emptied (${res.purged_count} items purged permanently).`);
      await this.loadTrash();
    } catch (err: any) {
      this.showToast(err.message || 'Failed to empty trash', true);
    } finally {
      this.isPurging.set(false);
    }
  }

  private showToast(msg: string, isError = false): void {
    this.toastMessage.set(msg);
    this.toastIsError.set(isError);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set('');
      }
    }, 4500);
  }
}
