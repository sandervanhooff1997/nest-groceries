import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IShoppingListRepository } from '../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '../entities/shopping-list.entity';
import type { ShoppingListDocument } from '../schemas/shopping-list.schema';
import { mapDocument, mapDocuments } from '../../shared/mappers/entity-mapper';

@Injectable()
export class ShoppingListRepository implements IShoppingListRepository {
  constructor(
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingListDocument>,
  ) {}

  async create(shoppingList: ShoppingList): Promise<ShoppingList> {
    const createdShoppingList =
      await this.shoppingListModel.create(shoppingList);
    return ShoppingList.fromDocument(createdShoppingList);
  }

  async findAllByUser(userId: string): Promise<ShoppingList[]> {
    const shoppingLists = await this.shoppingListModel
      .find({ createdBy: userId })
      .exec();
    return mapDocuments(shoppingLists, ShoppingList.fromDocument);
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<ShoppingList | null> {
    const shoppingList = await this.shoppingListModel
      .findOne({ _id: id, createdBy: userId })
      .exec();
    return mapDocument(shoppingList, ShoppingList.fromDocument);
  }

  async updateForUser(
    id: string,
    userId: string,
    shoppingList: Partial<ShoppingList>,
  ): Promise<ShoppingList | null> {
    const updatedShoppingList = await this.shoppingListModel
      .findOneAndUpdate({ _id: id, createdBy: userId }, shoppingList, {
        new: true,
        runValidators: true,
      })
      .exec();

    return mapDocument(updatedShoppingList, ShoppingList.fromDocument);
  }

  async deleteForUser(
    id: string,
    userId: string,
  ): Promise<ShoppingList | null> {
    const deletedShoppingList = await this.shoppingListModel
      .findOneAndDelete({ _id: id, createdBy: userId })
      .exec();
    return mapDocument(deletedShoppingList, ShoppingList.fromDocument);
  }
}
