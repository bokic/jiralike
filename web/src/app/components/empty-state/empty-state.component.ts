import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="ui-empty-state-card">
      <div class="ui-empty-icon-wrap">
        <app-icon [name]="icon" [size]="24" />
      </div>
      <h4 class="ui-empty-title">{{ title }}</h4>
      @if (description) {
        <p class="ui-empty-desc">{{ description }}</p>
      }
      @if (actionLabel) {
        <button type="button" class="btn btn-secondary btn-sm u-mt-2" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon: IconName = 'search';
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
