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
      createdBy: user._id.toString(),
      updatedBy: user._id.toString(),
    });

    const findByIdForUser = jest.fn().mockResolvedValue(sourceList);
    const create = jest.fn().mockResolvedValue(duplicatedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create,
      findAllByUser: jest.fn(),
      findByIdForUser,
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
    };
    const handler = new DuplicateShoppingListHandler(repository);

    const result = await handler.execute(
      new DuplicateShoppingListCommand('source-list-id', user),
    );

    expect(findByIdForUser).toHaveBeenCalledWith(
      'source-list-id',
      user._id.toString(),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: sourceList.name,
        nextId: sourceList._id,
        createdBy: user._id.toString(),
        updatedBy: user._id.toString(),
      }),
    );
    expect(result).toEqual(duplicatedList);
  });

  it('should throw when duplicating a non-owned shopping list', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn().mockResolvedValue(null),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
    };
    const handler = new DuplicateShoppingListHandler(repository);

    await expect(
      handler.execute(new DuplicateShoppingListCommand('missing-id', user)),
    ).rejects.toThrow(NotFoundException);
  });
});
