import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IShoppingListRepository } from '../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '../entities/shopping-list.entity';
import type { GroceryItem } from '../entities/grocery-item.entity';
import type { GroceryItem as GroceryItemSchema } from '../schemas/grocery-item.schema';
import type { ShoppingListDocument } from '../schemas/shopping-list.schema';
import type { User } from '@shared/entities/user.entity';
import { UserRepository } from '@shared/repositories/user.repository';
import { mapDocument, mapDocuments } from '@shared/mappers/entity-mapper';

@Injectable()
export class ShoppingListRepository implements IShoppingListRepository {
  constructor(
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingListDocument>,
    private readonly userRepository: UserRepository,
  ) {}

  async create(shoppingList: ShoppingList): Promise<ShoppingList> {
    const created = await this.shoppingListModel.create(shoppingList);
    return this.populate(ShoppingList.fromDocument(created));
  }

  async findById(id: string): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel.findById(id).exec();
    const entity = mapDocument(doc, ShoppingList.fromDocument);
    return entity ? this.populate(entity) : null;
  }

  async findAllAccessibleByUser(user: User): Promise<ShoppingList[]> {
    const docs = await this.shoppingListModel
      .find(this.accessFilter(user))
      .exec();
    const entities = mapDocuments(docs, ShoppingList.fromDocument);
    return this.populateMany(entities);
  }

  async findByIdForUser(id: string, user: User): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOne({ _id: id, ...this.accessFilter(user) })
      .exec();
    const entity = mapDocument(doc, ShoppingList.fromDocument);
    return entity ? this.populate(entity) : null;
  }

  async updateForUser(
    id: string,
    user: User,
    patch: { name?: string; items?: GroceryItem[] },
  ): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: id, ...this.manageFilter(user) },
        { ...patch, updatedBy: user.userId },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async deleteForUser(id: string, user: User): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOneAndDelete({ _id: id, ...this.manageFilter(user) })
      .exec();
    return this.maybePopulate(doc);
  }

  async addOwner(
    listId: string,
    ownerInternalId: string,
    actor: User,
  ): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: listId },
        {
          $addToSet: { ownerIds: ownerInternalId },
          $pull: { participantIds: ownerInternalId },
          $set: { updatedBy: actor.userId },
        },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async addParticipant(
    listId: string,
    participantInternalId: string,
    actor: User,
  ): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: listId },
        {
          $addToSet: { participantIds: participantInternalId },
          $pull: { ownerIds: participantInternalId },
          $set: { updatedBy: actor.userId },
        },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async removeMember(
    listId: string,
    memberInternalId: string,
    actor: User,
  ): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: listId },
        {
          $pull: {
            ownerIds: memberInternalId,
            participantIds: memberInternalId,
          },
          $set: { updatedBy: actor.userId },
        },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async addItemForUser(
    id: string,
    user: User,
    item: GroceryItem,
  ): Promise<ShoppingList | null> {
    const existing = await this.shoppingListModel
      .findOne({ _id: id, ...this.accessFilter(user) }, { 'items._id': 1 })
      .exec();
    if (!existing) return null;

    const itemWithOrder = { ...item, order: existing.items.length };
    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: id, ...this.accessFilter(user) },
        {
          $push: { items: itemWithOrder },
          $set: { updatedBy: user.userId },
        },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async removeItemForUser(
    id: string,
    user: User,
    itemId: string,
  ): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: id, ...this.accessFilter(user), 'items._id': itemId },
        {
          $pull: { items: { _id: itemId } },
          $set: { updatedBy: user.userId },
        },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async updateItemForUser(
    id: string,
    user: User,
    itemId: string,
    patch: Partial<Pick<GroceryItem, 'name' | 'quantity' | 'unit'>>,
  ): Promise<ShoppingList | null> {
    const $set: Record<string, unknown> = { updatedBy: user.userId };
    if (patch.name !== undefined) $set['items.$.name'] = patch.name;
    if (patch.quantity !== undefined) $set['items.$.quantity'] = patch.quantity;
    if (patch.unit !== undefined) $set['items.$.unit'] = patch.unit;

    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: id, ...this.accessFilter(user), 'items._id': itemId },
        { $set },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async reorderItemsForUser(
    id: string,
    user: User,
    itemIds: string[],
  ): Promise<ShoppingList | null> {
    const shoppingList = await this.shoppingListModel
      .findOne({ _id: id, ...this.accessFilter(user) })
      .exec();
    if (!shoppingList) return null;

    type SubDocument = GroceryItemSchema & { _id: { toString(): string } };
    const itemMap = new Map(
      shoppingList.items.map((item) => {
        const sub = item as unknown as SubDocument;
        return [sub._id.toString(), sub];
      }),
    );
    const reorderedItems = itemIds
      .map((itemId, index) => {
        const item = itemMap.get(itemId);
        if (!item) return null;
        return {
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          purchased: item.purchased,
          order: index,
        };
      })
      .filter(Boolean);

    if (reorderedItems.length !== shoppingList.items.length) return null;

    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: id, ...this.accessFilter(user) },
        { $set: { items: reorderedItems, updatedBy: user.userId } },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  async setItemPurchasedForUser(
    id: string,
    user: User,
    itemId: string,
    purchased: boolean,
  ): Promise<ShoppingList | null> {
    const doc = await this.shoppingListModel
      .findOneAndUpdate(
        { _id: id, ...this.accessFilter(user), 'items._id': itemId },
        {
          $set: {
            'items.$.purchased': purchased,
            updatedBy: user.userId,
          },
        },
        { new: true, runValidators: true },
      )
      .exec();
    return this.maybePopulate(doc);
  }

  /**
   * Lists where the user can view + manage items (creator, co-owner, participant).
   */
  private accessFilter(user: User): Record<string, unknown> {
    const conditions: Array<Record<string, unknown>> = [
      { createdBy: user.userId },
    ];
    if (user._id) {
      conditions.push({ ownerIds: user._id });
      conditions.push({ participantIds: user._id });
    }
    return { $or: conditions };
  }

  /**
   * Lists where the user can mutate the list itself (creator + co-owners).
   * Participants are excluded.
   */
  private manageFilter(user: User): Record<string, unknown> {
    const conditions: Array<Record<string, unknown>> = [
      { createdBy: user.userId },
    ];
    if (user._id) {
      conditions.push({ ownerIds: user._id });
    }
    return { $or: conditions };
  }

  private async maybePopulate(
    doc: ShoppingListDocument | null,
  ): Promise<ShoppingList | null> {
    const entity = mapDocument(doc, ShoppingList.fromDocument);
    return entity ? this.populate(entity) : null;
  }

  private async populate(list: ShoppingList): Promise<ShoppingList> {
    const ids = Array.from(new Set([...list.ownerIds, ...list.participantIds]));
    if (ids.length === 0) {
      return list;
    }
    const users = await this.userRepository.findByIds(ids);
    const byId = new Map(users.map((u) => [u._id, u]));
    list.owners = list.ownerIds
      .map((id) => byId.get(id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u))
      .map((u) => ({ _id: u._id ?? '', email: u.email ?? '' }));
    list.participants = list.participantIds
      .map((id) => byId.get(id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u))
      .map((u) => ({ _id: u._id ?? '', email: u.email ?? '' }));
    return list;
  }

  private async populateMany(lists: ShoppingList[]): Promise<ShoppingList[]> {
    const ids = Array.from(
      new Set(lists.flatMap((l) => [...l.ownerIds, ...l.participantIds])),
    );
    if (ids.length === 0) {
      return lists;
    }
    const users = await this.userRepository.findByIds(ids);
    const byId = new Map(users.map((u) => [u._id, u]));
    for (const list of lists) {
      list.owners = list.ownerIds
        .map((id) => byId.get(id))
        .filter((u): u is NonNullable<typeof u> => Boolean(u))
        .map((u) => ({ _id: u._id ?? '', email: u.email ?? '' }));
      list.participants = list.participantIds
        .map((id) => byId.get(id))
        .filter((u): u is NonNullable<typeof u> => Boolean(u))
        .map((u) => ({ _id: u._id ?? '', email: u.email ?? '' }));
    }
    return lists;
  }
}
