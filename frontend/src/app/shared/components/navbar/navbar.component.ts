import { Component, inject, output, signal, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  toggleSidebar = output<void>();
  isProfilePopoverOpen = signal<boolean>(false);

  private resizeObserver: ResizeObserver | null = null;

  ngOnInit(): void {
    // Close the popover automatically when the viewport grows beyond the mobile breakpoint.
    this.resizeObserver = new ResizeObserver(() => {
      if (window.innerWidth > 480 && this.isProfilePopoverOpen()) {
        this.isProfilePopoverOpen.set(false);
      }
    });
    this.resizeObserver.observe(document.documentElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleProfilePopover(event: Event): void {
    // Popover is only visible on mobile (≤480px); ignore on desktop
    if (window.innerWidth > 480) return;
    event.stopPropagation();
    this.isProfilePopoverOpen.update(val => !val);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.isProfilePopoverOpen() && !this.elementRef.nativeElement.contains(target)) {
      this.isProfilePopoverOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
