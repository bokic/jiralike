import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { UiFeedbackService } from './services/ui-feedback.service';
import { BoardCardComponent } from './components/board-card/board-card.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { WorkItem } from './models/jira.models';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render main-viewport container', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('main.main-viewport')).toBeTruthy();
  });

  it('should toggle and close nav menus cleanly', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.toggleNavMenu('planning');
    expect(app.openNavMenu()).toBe('planning');

    app.toggleNavMenu('settings');
    expect(app.openNavMenu()).toBe('settings');

    app.closeAllMenus();
    expect(app.openNavMenu()).toBeNull();
  });

  it('should open command palette and quick create modal', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.openCommandPalette();
    expect(app.showCommandPalette()).toBeTrue();

    app.openCreateModal();
    expect(app.showCreateModal()).toBeTrue();
  });
});

describe('UiFeedbackService', () => {
  let ui: UiFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    ui = TestBed.inject(UiFeedbackService);
  });

  it('should add and dismiss toasts', () => {
    ui.toast('Saved!', 'success', 0);
    expect(ui.toasts().length).toBe(1);
    const id = ui.toasts()[0].id;
    ui.dismissToast(id);
    expect(ui.toasts().length).toBe(0);
  });

  it('should resolve confirm dialogs', async () => {
    const promise = ui.confirm({ title: 'Delete', message: 'Sure?', danger: true });
    expect(ui.activeConfirm()).toBeTruthy();
    ui.resolveConfirm(true);
    expect(await promise).toBeTrue();
    expect(ui.activeConfirm()).toBeNull();
  });

  it('should resolve prompt dialogs', async () => {
    const promise = ui.prompt({ title: 'Rename', message: 'Name:', defaultValue: 'Alpha' });
    expect(ui.promptInput()).toBe('Alpha');
    ui.promptInput.set('Beta');
    ui.resolvePrompt(true);
    expect(await promise).toBe('Beta');
    expect(ui.activePrompt()).toBeNull();
  });
});

describe('BoardCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render issue key and title', () => {
    const fixture = TestBed.createComponent(BoardCardComponent);
    const comp = fixture.componentInstance;
    comp.item = {
      id: 1,
      key: 'JIRA-101',
      title: 'Fix dark mode contrast',
      type: 'Task',
      category: 'Software',
      status: 'To Do',
      priority: 'High',
      progress: 50,
      story_points: 3,
      labels: 'ui, a11y',
      assignee_name: 'Alice Smith',
      assignee_color: '#0052cc',
      subtask_count: 0,
      attachment_count: 0,
      comment_count: 2,
    } as unknown as WorkItem;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.issue-key')?.textContent?.trim()).toBe('JIRA-101');
    expect(el.querySelector('.card-title')?.textContent?.trim()).toBe('Fix dark mode contrast');
    expect(comp.initials('Alice Smith')).toBe('AS');
    expect(comp.splitLabels('ui, a11y')).toEqual(['ui', 'a11y']);
  });
});

describe('EmptyStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();
  });

  it('should render title, description, and emit action on click', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    const comp = fixture.componentInstance;
    comp.title = 'Nothing here';
    comp.description = 'Try clearing filters.';
    comp.actionLabel = 'Clear';
    let clicked = false;
    comp.action.subscribe(() => (clicked = true));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.ui-empty-title')?.textContent).toContain('Nothing here');
    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(clicked).toBeTrue();
  });
});
