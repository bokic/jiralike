import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoardColumn, WorkItem } from '../../models/jira.models';

@Component({
  selector: 'app-board-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="issue-card kanban-card"
      [attr.data-item-key]="item.key"
      [attr.data-item-id]="item.id"
      draggable="true"
      [style.border-left-color]="colorStrip"
      [class.dragging]="isDragging"
      (dragstart)="dragStarted.emit($event)"
      (dragend)="dragEnded.emit()"
    >
      <div class="card-top">
        <a [routerLink]="['/', item.key]" class="issue-key">{{ item.key }}</a>
        <div class="u-flex u-items-center u-gap-1">
          @if ((col?.statuses?.length || 0) > 1) {
            <span class="state-pill" [attr.data-state]="item.status" style="font-size: 10px; padding: 1px 6px;">
              {{ item.status }}
            </span>
          }
          <span class="priority-badge" [attr.data-priority]="item.priority">
            {{ item.priority }}
          </span>
        </div>
      </div>

      <div class="card-top">
        <span class="type-badge" [attr.data-type]="item.type">{{ item.type }}</span>
        <span class="cat-badge" [attr.data-cat]="item.category">{{ item.category }}</span>
      </div>

      @if (item.parent_key) {
        <div class="parent-chip">↳ {{ item.parent_key }}: {{ item.parent_title }}</div>
      }

      <a [routerLink]="['/', item.key]" class="card-title">{{ item.title }}</a>

      @if (showComponents || showFixVersions || showLabels) {
        <div class="card-labels">
          @if (item.resolution_name) {
            <span class="label-chip" style="background: var(--success-bg); color: var(--success-color);">✔ {{ item.resolution_name }}</span>
          }
          @if (showComponents) {
            @for (comp of item.components || []; track comp.id) {
              <span class="label-chip" style="background: var(--info-bg); color: var(--brand-primary);">🧩 {{ comp.name }}</span>
            }
          }
          @if (showFixVersions) {
            @for (fv of item.fix_versions || []; track fv.id) {
              <span class="label-chip" style="background: #f3e8ff; color: #6b21a8;">🚀 {{ fv.name }}</span>
            }
          }
          @if (showLabels) {
            @for (lbl of splitLabels(item.labels); track lbl) {
              <span class="label-chip">{{ lbl }}</span>
            }
          }
        </div>
      }

      @if (showDueDate && item.due_date) {
        <div class="u-text-xs u-text-muted u-mt-1">
          📅 Due: <strong>{{ item.due_date }}</strong>
        </div>
      }

      <div class="card-progress">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="item.progress"></div>
        </div>
        <span class="progress-text">{{ item.progress }}%</span>
      </div>

      <div class="card-footer">
        <div class="card-meta">
          @if (showStoryPoints && item.story_points > 0) {
            <span class="points-badge" title="Story Points">{{ item.story_points }} SP</span>
          }
          @if (item.time_spent_formatted || item.remaining_estimate_formatted || item.original_estimate_formatted) {
            <span
              class="points-badge"
              style="background: var(--info-bg); color: var(--brand-primary);"
              [title]="'Time Spent: ' + (item.time_spent_formatted || '0m') + ' / Remaining: ' + (item.remaining_estimate_formatted || '0m')"
            >
              ⏱ {{ item.time_spent_formatted || '0m' }}/{{ item.remaining_estimate_formatted || item.original_estimate_formatted || '0m' }}
            </span>
          }
          @if (item.tshirt_size) {
            <span class="label-chip" style="background: #fdf2f8; color: #be185d;" title="T-Shirt Size">
              👕 {{ item.tshirt_size }}
            </span>
          }
          @if (item.subtask_count > 0) {
            <span class="meta-icon" title="Subtasks">⧉ {{ item.subtask_count }}</span>
          }
          @if (item.attachment_count > 0) {
            <span class="meta-icon" title="Blob Attachments">📎 {{ item.attachment_count }}</span>
          }
          @if (item.comment_count > 0) {
            <span class="meta-icon" title="Comments">💬 {{ item.comment_count }}</span>
          }
        </div>

        @if (item.assignee_name) {
          <div
            class="avatar-circle"
            [style.background]="item.assignee_color"
            [title]="'Assigned to ' + item.assignee_name"
          >
            {{ initials(item.assignee_name) }}
          </div>
        } @else {
          <div class="avatar-circle unassigned" title="Unassigned">?</div>
        }
      </div>
    </div>
  `,
})
export class BoardCardComponent {
  @Input({ required: true }) item!: WorkItem;
  @Input() col: BoardColumn | null = null;
  @Input() colorStrip = 'transparent';
  @Input() isDragging = false;
  @Input() showComponents = false;
  @Input() showFixVersions = false;
  @Input() showLabels = false;
  @Input() showDueDate = false;
  @Input() showStoryPoints = true;

  @Output() dragStarted = new EventEmitter<DragEvent>();
  @Output() dragEnded = new EventEmitter<void>();

  splitLabels(labels?: string | null): string[] {
    if (!labels) return [];
    return labels
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  initials(name?: string | null): string {
    if (!name) return '?';
    return name
      .split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
