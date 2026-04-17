import { NotFoundException } from '@nestjs/common';
import { UserFactory, ShoppingListFactory } from '@common/factories';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  DeleteShoppingListCommand,
  DeleteShoppingListHandler,
} from './delete-shopping-list.handler';

describe('DeleteShoppingListHandler', () => {
  const user = UserFactory.create({
    email: 'owner@example.com',
    firstName: 'Owner',
    lastName: 'User',
  });

  it('should delete a shopping list for the current user', async () => {
    const deletedList = ShoppingListFactory.create({
      _id: 'list-id',
      name: 'Weekly',
    });
    const deleteForUser = jest.fn().mockResolvedValue(deletedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser,
    };
    const handler = new DeleteShoppingListHandler(repository);

    const result = await handler.execute(
      new DeleteShoppingListCommand('list-id', user),
    );

    expect(deleteForUser).toHaveBeenCalledWith('list-id', user._id.toString());
    expect(result).toEqual(deletedList);
  });

  it('should throw when deleting a non-owned shopping list', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn().mockResolvedValue(null),
    };
    const handler = new DeleteShoppingListHandler(repository);

    await expect(
      handler.execute(new DeleteShoppingListCommand('missing-id', user)),
    ).rejects.toThrow(NotFoundException);
  });
});
