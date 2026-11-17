import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    @if (variant === 'board') {
      <div class="ui-skeleton-board" role="status" aria-label="Loading board">
        @for (col of [1, 2, 3, 4]; track col) {
          <div class="ui-skeleton-col">
            <div class="ui-skeleton ui-skeleton-title"></div>
            <div class="ui-skeleton ui-skeleton-card"></div>
            <div class="ui-skeleton ui-skeleton-card"></div>
            <div class="ui-skeleton ui-skeleton-card" style="height: 68px;"></div>
          </div>
        }
      </div>
    } @else if (variant === 'cards') {
      <div class="ui-skeleton-grid" role="status" aria-label="Loading content">
        @for (c of [1, 2, 3]; track c) {
          <div class="ui-skeleton ui-skeleton-card" style="height: 110px;"></div>
        }
      </div>
    } @else if (variant === 'table') {
      <div class="ui-skeleton-table" role="status" aria-label="Loading table">
        <div class="ui-skeleton ui-skeleton-line" style="height: 36px;"></div>
        @for (r of [1, 2, 3, 4, 5]; track r) {
          <div class="ui-skeleton ui-skeleton-line" style="height: 28px;"></div>
        }
      </div>
    } @else {
      <div class="ui-spinner-box" role="status">
        <span class="ui-spinner"></span>
        @if (message) {
          <span class="u-text-sm u-text-muted">{{ message }}</span>
        }
      </div>
    }
  `,
})
export class LoadingStateComponent {
  @Input() variant: 'spinner' | 'cards' | 'board' | 'table' = 'spinner';
  @Input() message = 'Loading...';
}
