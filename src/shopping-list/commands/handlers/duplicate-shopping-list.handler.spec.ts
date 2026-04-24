import { NotFoundException } from '@nestjs/common';
import {
  ShoppingListFactory,
  UserFactory,
  GroceryItemFactory,
} from '@common/factories';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  DuplicateShoppingListCommand,
  DuplicateShoppingListHandler,
} from './duplicate-shopping-list.handler';
import type { ShoppingList } from '@shopping-list/entities/shopping-list.entity';

describe('DuplicateShoppingListHandler', () => {
  const user = UserFactory.create({
    email: 'owner@example.com',
    firstName: 'Owner',
    lastName: 'User',
  });

  it('should duplicate a shopping list and set nextId to the source list id', async () => {
    const sourceList = ShoppingListFactory.create({
      _id: 'source-list-id',
      name: 'Weekly groceries',
      items: [GroceryItemFactory.create({ name: 'Milk' })],
    });
    const duplicatedList = ShoppingListFactory.create({
      _id: 'duplicate-list-id',
      name: 'Weekly groceries',
      nextId: 'source-list-id',
      items: [GroceryItemFactory.create({ name: 'Milk' })],
      createdBy: user.userId,
      updatedBy: user.userId,
    });

    const findByIdForUser = jest.fn().mockResolvedValue(sourceList);
    const create = jest.fn().mockResolvedValue(duplicatedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create,
      findById: jest.fn(),
      findAllAccessibleByUser: jest.fn(),
      findByIdForUser,
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addOwner: jest.fn(),
      addParticipant: jest.fn(),
      removeMember: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn(),
      reorderItemsForUser: jest.fn(),
      updateItemForUser: jest.fn(),
    };
    const handler = new DuplicateShoppingListHandler(repository);

    const result = await handler.execute(
      new DuplicateShoppingListCommand('source-list-id', user),
    );

    expect(findByIdForUser).toHaveBeenCalledWith('source-list-id', user);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: sourceList.name,
        nextId: sourceList._id,
        createdBy: user.userId,
        updatedBy: user.userId,
      }),
    );
    expect(result).toEqual(duplicatedList);
  });

  it('should throw when duplicating a non-owned shopping list', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllAccessibleByUser: jest.fn(),
      findByIdForUser: jest.fn().mockResolvedValue(null),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addOwner: jest.fn(),
      addParticipant: jest.fn(),
      removeMember: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn(),
      reorderItemsForUser: jest.fn(),
      updateItemForUser: jest.fn(),
    };
    const handler = new DuplicateShoppingListHandler(repository);

    await expect(
      handler.execute(new DuplicateShoppingListCommand('missing-id', user)),
    ).rejects.toThrow(NotFoundException);
  });

  it('should duplicate only selected items when itemIds are provided', async () => {
    const milk = GroceryItemFactory.create({ _id: 'item-milk', name: 'Milk' });
    const bread = GroceryItemFactory.create({
      _id: 'item-bread',
      name: 'Bread',
    });
    const sourceList = ShoppingListFactory.create({
      _id: 'source-list-id',
      name: 'Weekly groceries',
      items: [milk, bread],
    });

    const findByIdForUser = jest.fn().mockResolvedValue(sourceList);
    const create = jest
      .fn()
      .mockImplementation((shoppingList: ShoppingList) => shoppingList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create,
      findById: jest.fn(),
      findAllAccessibleByUser: jest.fn(),
      findByIdForUser,
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addOwner: jest.fn(),
      addParticipant: jest.fn(),
      removeMember: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn(),
      reorderItemsForUser: jest.fn(),
      updateItemForUser: jest.fn(),
    };
    const handler = new DuplicateShoppingListHandler(repository);

    const result = await handler.execute(
      new DuplicateShoppingListCommand('source-list-id', user, ['item-bread']),
    );

    expect(findByIdForUser).toHaveBeenCalledWith('source-list-id', user);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?._id).toBe('item-bread');
  });
});
