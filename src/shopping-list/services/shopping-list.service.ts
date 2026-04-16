import { Injectable } from '@nestjs/common';
import { ShoppingListRepository } from '../repository/shopping-list.repository';
import { IShoppingList } from '../interfaces/shopping-list.interface';

@Injectable()
export class ShoppingListService {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepository,
  ) {}

  async create(shoppingList: IShoppingList) {
    return this.shoppingListRepository.create(shoppingList);
  }

  async findAll() {
    return this.shoppingListRepository.findAll();
  }

  async findById(id: string) {
    return this.shoppingListRepository.findById(id);
  }

  async update(id: string, shoppingList: Partial<IShoppingList>) {
    return this.shoppingListRepository.update(id, shoppingList);
  }

  async delete(id: string) {
    return this.shoppingListRepository.delete(id);
  }
}
