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
      label: 'Tableau de bord',
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
      label: 'Stocks',
      route: '/stock',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VENDEUR'],
      premium: false
    },
    {
      label: 'Utilisateurs',
      route: '/users',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false
    },
    {
      label: 'Rapports',
      route: '/reports',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false
    },
    {
      label: 'Ventes',
      route: '/sales',
      roles: ['SUPER_ADMIN', 'ADMIN', 'CAISSIER'],
      premium: false
    },
    {
      label: 'Paramètres',
      route: '/settings',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      premium: false
    },
    {
      label: 'Comptes',
      route: '/compte',
      roles: ['SUPER_ADMIN'],
      premium: false
    },
    {
      label: 'Utilisateurs admin',
      route: '/admin-users',
      roles: ['SUPER_ADMIN'],
      premium: false
    },
    {
      label: 'Abonnements',
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