import { CommonModule, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './table-component.html',
  styleUrl: './table-component.css',
})
export class TableComponent {
  @Input() actions: boolean = false;
  @Input() enableSearch: boolean = false;
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() titre: string = ''

  @Input() roleStyleFn!: (value: string) => any;

  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();


  searchText: string = '';

  get filteredData() {
    if (!this.searchText) return this.data;

    const search = this.searchText.toLowerCase();

    return this.data.filter(row =>
      this.columns.some(col =>
        String(row[col.field])
          ?.toLowerCase()
          .includes(search)
      )
    );
  }

}
