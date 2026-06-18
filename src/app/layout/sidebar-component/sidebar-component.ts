import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
})
export class SidebarComponent {

  private authService = inject(AuthService);

  menu = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VENDEUR', 'CAISSIER'],
      premium: false
    },
    {
      label: 'Produits',
      route: '/products',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VENDEUR'],
      premium: false
    },
    {
      label: 'Stock',
      route: '/stock',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VENDEUR'],
      premium: false
    },
    {
      label: 'Users',
      route: '/users',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false
    },
    {
      label: 'Reports',
      route: '/reports',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false
    },
    {
      label: 'Sales',
      route: '/sales',
      roles: ['SUPER_ADMIN', 'ADMIN', 'CAISSIER'],
      premium: false
    },
    {
      label: 'Settings',
      route: '/settings',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false
    },
    {
      label: 'Compte',
      route: '/compte',
      roles: ['SUPER_ADMIN'],
      premium: false
    },
    {
      label: 'AdminUsers',
      route: '/admin-users',
      roles: ['SUPER_ADMIN'],
      premium: false
    },
    {
      label: 'Abonnement',
      route: '/abonnement',
      roles: ['SUPER_ADMIN'],
      premium: false
    },
    {
      label: 'Fourniseurs',
      route: '/fournisseurs',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false
    }
  ];

  get filteredMenu() {

    const role = this.authService.getRole();
    const abonnement = this.authService.getAbonnement();

    const isSuperAdmin =
      role === 'SUPER_ADMIN_SAGE_066062594';

    return this.menu.filter(item => {

      const roleOk =
        isSuperAdmin ||
        item.roles.includes(role);

      const abonnementOk =
        isSuperAdmin ||
        abonnement === 'ACTIF' ||
        !item.premium;

      return roleOk && abonnementOk;
    });
  }

  get isBlocked(): boolean {

    const abonnement =
      this.authService.getAbonnement();

    return (
      abonnement === 'BLOQUE' ||
      abonnement === 'EXPIRE'
    );
  }
}