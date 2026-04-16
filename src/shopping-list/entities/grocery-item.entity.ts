export class GroceryItemEntity {
  name: string;
  quantity?: number;
  unit?: string;
  purchased?: boolean;

  constructor(partial?: Partial<GroceryItemEntity>) {
    Object.assign(this, partial);
  }
}
