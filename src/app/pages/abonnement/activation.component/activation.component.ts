import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-activation',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './activation.component.html',
  styleUrl: './activation.component.css',
})
export class ActivationComponent {
  // Injection de la référence du dialog pour pouvoir le fermer et renvoyer la valeur
  private dialogRef = inject(MatDialogRef<ActivationComponent>);

  joursSaisis: number = 30; // Valeur par défaut proposée à l'administrateur

  // Appelé lors du clic sur "Confirmer l'accès"
  confirmer() {
    if (!this.joursSaisis || this.joursSaisis < 1) {
      alert('Veuillez saisir un nombre de jours valide.');
      return;
    }
    // On ferme le modal en renvoyant la durée choisie au composant parent
    this.dialogRef.close(this.joursSaisis);
  }

  // Appelé lors du clic sur "Annuler" ou sur la croix
  annuler() {
    // On ferme le modal sans renvoyer de valeur (null)
    this.dialogRef.close(null);
  }
}