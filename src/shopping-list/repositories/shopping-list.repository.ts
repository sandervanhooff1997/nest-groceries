import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ShoppingList as ShoppingListSchemaModel,
  type ShoppingListDocument,
} from '../schemas/shopping-list.schema';
import type { IShoppingListRepository } from '../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '../entities/shopping-list.entity';
import { mapDocument, mapDocuments } from '../../shared/mappers/entity-mapper';

@Injectable()
export class ShoppingListRepository implements IShoppingListRepository {
  constructor(
    @InjectModel(ShoppingListSchemaModel.name)
    private readonly shoppingListModel: Model<ShoppingListDocument>,
  ) {}

  async create(shoppingList: ShoppingList): Promise<ShoppingList> {
    const createdShoppingList =
      await this.shoppingListModel.create(shoppingList);
    return ShoppingList.fromDocument(createdShoppingList);
  }

  async findAll(): Promise<ShoppingList[]> {
    const shoppingLists = await this.shoppingListModel.find().exec();
    return mapDocuments(shoppingLists, ShoppingList.fromDocument);
  }

  async findById(id: string): Promise<ShoppingList | null> {
    const shoppingList = await this.shoppingListModel.findById(id).exec();
    return mapDocument(shoppingList, ShoppingList.fromDocument);
  }

  async update(
    id: string,
    shoppingList: Partial<ShoppingList>,
  ): Promise<ShoppingList | null> {
    const updatedShoppingList = await this.shoppingListModel
      .findByIdAndUpdate(id, shoppingList, {
        new: true,
        runValidators: true,
      })
      .exec();

    return mapDocument(updatedShoppingList, ShoppingList.fromDocument);
  }

  async delete(id: string): Promise<ShoppingList | null> {
    const deletedShoppingList = await this.shoppingListModel
      .findByIdAndDelete(id)
      .exec();
    return mapDocument(deletedShoppingList, ShoppingList.fromDocument);
  }
}
