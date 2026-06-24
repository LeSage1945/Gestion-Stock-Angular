import { BehaviorSubject, switchMap, map, Observable, tap } from 'rxjs';
import { Component, inject, OnInit } from '@angular/core';

import { UserService } from './user.service';
import { GlobalServiceService } from '../../core/service/global-service.service';

import { MatDialog } from '@angular/material/dialog';

import { ModalUserComponent } from './modal-user-component/modal-user-component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog-component/confirm-dialog-component';

import { TableComponent } from "../../shared/components/table-component/table-component";
import { LoaderComponent } from "../../shared/components/loader-component/loader-component";

import { AsyncPipe } from '@angular/common';
import { user } from './model/user.model';

@Component({
  selector: 'app-users-component',
  standalone: true,
  templateUrl: './users-component.html',
  styleUrl: './users-component.css',
  imports: [TableComponent, LoaderComponent, AsyncPipe],
})
export class UsersComponent implements OnInit {

  // ================= SERVICES =================
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private globalService = inject(GlobalServiceService);

  // ================= STATE =================
  private refresh$ = new BehaviorSubject<boolean>(true);
  isLoading = true;

  // ================= USERS STREAM =================
  users$: Observable<user[]> = this.refresh$.pipe(
    switchMap(() =>
      this.userService.getAllUsers().pipe(
        map(users =>
          users.map(u => ({
            ...u,
            creeLe: this.globalService.formatDate(u.creeLe)
          }))
        ),
        tap(() => this.isLoading = false)
      )
    )
  );

  // ================= STATS =================
  totalUser$!: Observable<number>;
  totalAdmin$!: Observable<number>;
  totalCaissier$!: Observable<number>;

  // ================= TABLE CONFIG =================
  usersColumns = [
    { label: 'Nom', field: 'nom' },
    { label: 'Email', field: 'email' },
    { label: 'Role', field: 'role', isRole: true },
    { label: 'Date de création', field: 'creeLe' },
  ];

  titreTable = "📋 Liste des utilisateurs";

  // ================= INIT =================
  ngOnInit(): void {
    this.reloadUsers();
  }

  // ================= RELOAD =================
  reloadUsers(): void {
    this.isLoading = true;
    this.refresh$.next(true);

    this.totalUser$ = this.users$.pipe(map(u => u.length));
    this.totalAdmin$ = this.users$.pipe(map(u => u.filter(i => i.role === 'ADMIN').length));
    this.totalCaissier$ = this.users$.pipe(map(u => u.filter(i => i.role === 'CAISSIER').length));
  }

  // ================= ROLE STYLE =================
  getRoleStyle(role: string) {
    const base = { padding: '4px 8px', borderRadius: '6px', fontWeight: '500' };
    switch (role) {
      case 'ADMIN': return { ...base, color: '#dc3545' };
      case 'CAISSIER': return { ...base, color: '#ffc107' };
      case 'VENDEUR': return { ...base, color: '#0d6efd' };
      default: return base;
    }
  }

  // ================= CREATE =================
  onAdd() {
    const dialogRef = this.dialog.open(ModalUserComponent, {
      width: '1000px',
      height: '550px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.isLoading = true;
      console.log("coucou")

      this.userService.createUser(result).subscribe({
        next: () => {
          this.globalService.alert(
            'L\'utilisateur a été ajouté avec succès.',
            'Utilisateur créé ✅',
            'success',
            '',
            'OK'
          );
          this.reloadUsers();
        },
        error: (err) => {
          this.isLoading = false;
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la création',
            'Erreur création ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ================= VIEW =================
  onView(user: user) {
    this.dialog.open(ModalUserComponent, {
      width: '1000px',
      height: '550px',
      data: { action: 'view', data: user }
    });
  }

  // ================= EDIT =================
  onEdit(user: user) {
    const id = user.id;

    const dialogRef = this.dialog.open(ModalUserComponent, {
      width: '1000px',
      height: '550px',
      data: { mode: 'update', data: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.isLoading = true;

      this.userService.updateUser(id, result).subscribe({
        next: () => {
          this.globalService.alert(
            `L'utilisateur "${user.nom}" a été modifié avec succès.`,
            'Utilisateur modifié ✅',
            'success',
            '',
            'OK'
          );
          this.reloadUsers();
        },
        error: (err) => {
          this.isLoading = false;
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la modification',
            'Erreur modification ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ================= DELETE =================
  onDelete(user: user) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer utilisateur',
        message: `Voulez-vous supprimer "${user.nom}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.isLoading = true;

      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.globalService.alert(
            `L'utilisateur "${user.nom}" a été supprimé avec succès.`,
            'Utilisateur supprimé ✅',
            'success',
            '',
            'OK'
          );
          this.reloadUsers();
        },
        error: (err) => {
          this.isLoading = false;
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la suppression',
            'Erreur suppression ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }
}