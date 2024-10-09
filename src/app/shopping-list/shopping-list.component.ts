import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shopping-list',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent {
  newItem: string = '';
  items: { name: string, isPurchased: boolean }[] = [];

  addItem() {
    if (this.newItem.trim() !== '') {
      this.items.push({ name: this.newItem, isPurchased: false });
      this.newItem = '';
    }
  }

  togglePurchased(index: number) {
    this.items[index].isPurchased = !this.items[index].isPurchased;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }
}
