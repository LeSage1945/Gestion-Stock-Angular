import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './alert-component.html',
  styleUrl: './alert-component.css',
})
export class AlertComponent implements OnInit {

  title: string = 'Alerte !';
  content!: string;
  type!: 'danger' | 'info' | 'success';
  buttonOKName: string = 'OK';
  buttonCancelName: string = 'Annuler';
  styleAlert!: Object;
  backgroundColor!: string;
  textColor!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    // ✅ récupérer les données injectées
    this.title = this.data?.title ?? 'Alerte !';
    this.content = this.data?.content;
    this.type = this.data?.type;
    this.buttonOKName = this.data?.buttonOKName ?? 'OK';
    this.buttonCancelName = this.data?.buttonCancelName ?? '';

    if (!this.backgroundColor) {
      this.styleAlert = {
        'Message--green': this.type === 'success',
        'Message--red': this.type === 'danger',
        'Message--blue': this.type === 'info',
        'Message--orange': !this.type,
      };
    }
  }
}