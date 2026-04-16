import type { GroceryItemEntity } from './grocery-item.entity';

export class ShoppingListEntity {
  _id?: string;
  name: string;
  items: GroceryItemEntity[];
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<ShoppingListEntity>) {
    this.items = [];
    Object.assign(this, partial);
  }
}
