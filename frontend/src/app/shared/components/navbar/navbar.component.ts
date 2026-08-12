import { Component, inject, output, signal, HostListener, ElementRef } from '@angular/core';
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
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  toggleSidebar = output<void>();
  isProfilePopoverOpen = signal<boolean>(false);

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
    const target = event.target as HTMLElement;
    if (this.isProfilePopoverOpen() && !this.elementRef.nativeElement.contains(target)) {
      this.isProfilePopoverOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
