import { ShoppingListService, ShoppingListItem } from './../services/shopping-list.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  shoppingList: ShoppingListItem[] = [];
  userId: number | null = null;

  private authSubscription!: Subscription;

  constructor(
    private shoppingListService: ShoppingListService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.getUserIdObservable().subscribe(
      (id) => {
        console.log('Recebido userId:', id);
        if (id) {
          this.userId = id;
          this.fetchShoppingList();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }


  fetchShoppingList(): void {
    if (this.userId) {
      this.shoppingListService.getShoppingList(this.userId).subscribe(
        (data: ShoppingListItem[]) => {
          console.log('Dados recebidos:', data);
          this.shoppingList = data;
        },
        (error) => {
          console.error('Erro ao buscar a lista de compras:', error);
          this.toastr.error('Erro ao buscar a lista de compras.');
        }
      );
    }
  }

  /**
   * 
   * @param title 
   */
  addItem(title: string): void {
    if (this.userId && title.trim()) {
      console.log('Adicionando item para userId:', this.userId);
      const newItem: ShoppingListItem = {
        id: 0,
        title: title.trim(),
        userId: this.userId,
        included: false
      };
      this.shoppingListService.addItem(newItem).subscribe(
        (createdItem: ShoppingListItem) => {
          console.log('Item criado:', createdItem);
          this.shoppingList.push(createdItem);
          this.toastr.success(`Item "${createdItem.title}" adicionado com sucesso.`);
        },
        (error) => {
          console.error('Erro ao adicionar o item:', error);
          this.toastr.error('Erro ao adicionar o item.');
        }
      );
    } else {
      this.toastr.warning('userId não está disponível ou título está vazio.');
    }
  }

  /**
   * Remove um item da lista de compras.
   * @param item 
   */
  removeItem(item: ShoppingListItem): void {
    this.shoppingListService.deleteItem(item.id).subscribe(
      () => {
        this.shoppingList = this.shoppingList.filter(i => i.id !== item.id);
        this.toastr.success(`Item "${item.title}" removido com sucesso.`);
      },
      (error) => {
        console.error('Erro ao remover o item:', error);
        this.toastr.error('Erro ao remover o item.');
      }
    );
  }

  /**
   * 
   * @param item 
   */
  togglePurchased(item: ShoppingListItem): void {
    const updatedItem = { ...item, included: !item.included };
    this.shoppingListService.updateItem(updatedItem).subscribe(
      (updated: ShoppingListItem) => {
        const index = this.shoppingList.findIndex(i => i.id === updated.id);
        if (index !== -1) {
          this.shoppingList[index].included = updated.included;
          this.toastr.success(`Item "${updated.title}" atualizado com sucesso.`);
        }
      },
      (error) => {
        console.error('Erro ao atualizar o item:', error);
        this.toastr.error('Erro ao atualizar o item.');
      }
    );
  }
}
