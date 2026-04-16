import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShoppingList, ShoppingListDocument } from '../schemas/shopping-list.schema';
import { IShoppingList } from '../interfaces/shopping-list.interface';

@Injectable()
export class ShoppingListRepository {
  constructor(
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingListDocument>,
  ) {}

  async create(shoppingList: IShoppingList): Promise<ShoppingListDocument> {
    return this.shoppingListModel.create(shoppingList);
  }

  async findAll(): Promise<ShoppingListDocument[]> {
    return this.shoppingListModel.find().exec();
  }

  async findById(id: string): Promise<ShoppingListDocument | null> {
    return this.shoppingListModel.findById(id).exec();
  }

  async update(
    id: string,
    shoppingList: Partial<IShoppingList>,
  ): Promise<ShoppingListDocument | null> {
    return this.shoppingListModel.findByIdAndUpdate(id, shoppingList, {
      new: true,
    });
  }

  async delete(id: string): Promise<ShoppingListDocument | null> {
    return this.shoppingListModel.findByIdAndDelete(id);
  }
}
