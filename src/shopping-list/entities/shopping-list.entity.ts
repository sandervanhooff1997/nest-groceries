import type { ShoppingListDocument } from '../schemas/shopping-list.schema';
import { GroceryItem } from './grocery-item.entity';

/**
 * Member projection used by the entity layer. The schema only stores the
 * internal user `_id`; the email is hydrated from the user collection so
 * clients can render names/emails without a second roundtrip.
 */
export interface ListMember {
  _id: string;
  email: string;
}

export class ShoppingList {
  _id?: string;
  name: string;
  nextId?: string;
  items: GroceryItem[];
  /** Kinde userId of the creator. */
  createdBy: string;
  /** Kinde userId of the last mutator. */
  updatedBy: string;
  owners: ListMember[];
  participants: ListMember[];
  /** Raw internal user `_id`s as stored by the schema. Kept for repository use. */
  ownerIds: string[];
  participantIds: string[];
  isTemplate: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<ShoppingList>) {
    this.items = [];
    this.owners = [];
    this.participants = [];
    this.ownerIds = [];
    this.participantIds = [];
    this.isTemplate = false;
    Object.assign(this, partial);
  }

  /**
   * Builds an entity from a Mongoose document. `owners`/`participants` are
   * left as empty projections — the repository populates them after a bulk
   * lookup against the user collection.
   */
  static fromDocument(
    this: void,
    document: ShoppingListDocument,
  ): ShoppingList {
    return new ShoppingList({
      _id: document._id?.toString(),
      name: document.name,
      nextId: document.nextId,
      items: (document.items ?? []).map((item) =>
        GroceryItem.fromDocument(item),
      ),
      createdBy: document.createdBy,
      updatedBy: document.updatedBy,
      ownerIds: document.ownerIds ?? [],
      participantIds: document.participantIds ?? [],
      owners: [],
      participants: [],
      isTemplate: document.isTemplate ?? false,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
