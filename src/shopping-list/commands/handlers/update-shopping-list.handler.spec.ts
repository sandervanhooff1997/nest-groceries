import { NotFoundException } from '@nestjs/common';
import { UserFactory, ShoppingListFactory } from '@common/factories';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  UpdateShoppingListCommand,
  UpdateShoppingListHandler,
} from './update-shopping-list.handler';

describe('UpdateShoppingListHandler', () => {
  const user = UserFactory.create({
    email: 'owner@example.com',
    firstName: 'Owner',
    lastName: 'User',
  });

  it('should update a shopping list for the current user', async () => {
    const updatedList = ShoppingListFactory.create({
      _id: 'list-id',
      name: 'Updated',
    });
    const updateForUser = jest.fn().mockResolvedValue(updatedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser,
      deleteForUser: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn(),
    };
    const handler = new UpdateShoppingListHandler(repository);

    const result = await handler.execute(
      new UpdateShoppingListCommand('list-id', { name: 'Updated' }, user),
    );

    expect(updateForUser).toHaveBeenCalledWith(
      'list-id',
      user._id.toString(),
      expect.objectContaining({
        name: 'Updated',
        updatedBy: user._id.toString(),
      }),
    );
    expect(result).toEqual(updatedList);
  });

  it('should throw when updating a non-owned shopping list', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn().mockResolvedValue(null),
      deleteForUser: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn(),
    };
    const handler = new UpdateShoppingListHandler(repository);

    await expect(
      handler.execute(
        new UpdateShoppingListCommand('missing-id', { name: 'Updated' }, user),
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
