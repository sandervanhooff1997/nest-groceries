import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShoppingList, ShoppingListDocument } from '../schemas/shopping-list.schema';
import { IShoppingListRepository } from '../interfaces/shopping-list.repository.interface';
import { ShoppingListEntity } from '../entities/shopping-list.entity';

@Injectable()
export class ShoppingListRepository implements IShoppingListRepository {
  constructor(
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingListDocument>,
  ) {}

  async create(shoppingList: ShoppingListEntity): Promise<ShoppingListDocument> {
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
    shoppingList: Partial<ShoppingListEntity>,
  ): Promise<ShoppingListDocument | null> {
    return this.shoppingListModel.findByIdAndUpdate(id, shoppingList, {
      new: true,
    });
  }

  async delete(id: string): Promise<ShoppingListDocument | null> {
    return this.shoppingListModel.findByIdAndDelete(id);
  }
}
