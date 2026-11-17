import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Directive({
  selector: '[appTrapFocus]',
  standalone: true,
})
export class TrapFocusDirective implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private previousFocus: HTMLElement | null = null;
  private keydownHandler = (e: KeyboardEvent) => this.onKeydown(e);

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.previousFocus = document.activeElement as HTMLElement | null;
    const el = this.host.nativeElement;
    el.addEventListener('keydown', this.keydownHandler);

    setTimeout(() => {
      const autoEl = el.querySelector<HTMLElement>('[autofocus]');
      if (autoEl) {
        autoEl.focus();
        return;
      }
      const focusables = this.getFocusableElements();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        el.setAttribute('tabindex', '-1');
        el.focus();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.removeEventListener('keydown', this.keydownHandler);
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null
    );
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const focusables = this.getFocusableElements();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !this.host.nativeElement.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !this.host.nativeElement.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}
