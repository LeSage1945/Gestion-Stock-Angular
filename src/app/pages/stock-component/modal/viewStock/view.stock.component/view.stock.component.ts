import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view.stock.component',
  imports: [],
  templateUrl: './view.stock.component.html',
  styleUrl: './view.stock.component.css',
})
export class ViewStockComponent {
  
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);

  close() {
    this.dialogRef.close();
  }
}
