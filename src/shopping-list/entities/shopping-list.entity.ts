export class ShoppingListEntity {
  _id?: string;

  constructor(partial?: Partial<ShoppingListEntity>) {
    Object.assign(this, partial);
  }
}

