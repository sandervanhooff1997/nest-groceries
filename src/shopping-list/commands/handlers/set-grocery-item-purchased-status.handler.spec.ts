import { NotFoundException } from '@nestjs/common';
import { ShoppingListFactory, UserFactory } from '@common/factories';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  SetGroceryItemPurchasedStatusCommand,
  SetGroceryItemPurchasedStatusHandler,
} from './set-grocery-item-purchased-status.handler';

describe('SetGroceryItemPurchasedStatusHandler', () => {
  const user = UserFactory.create();

  it('should mark an item as purchased or not purchased', async () => {
    const updatedList = ShoppingListFactory.create({ _id: 'list-id' });
    const setItemPurchasedForUser = jest.fn().mockResolvedValue(updatedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser,
    };
    const handler = new SetGroceryItemPurchasedStatusHandler(repository);

    const result = await handler.execute(
      new SetGroceryItemPurchasedStatusCommand(
        'list-id',
        'item-id',
        true,
        user,
      ),
    );

    expect(setItemPurchasedForUser).toHaveBeenCalledWith(
      'list-id',
      user._id.toString(),
      'item-id',
      true,
    );
    expect(result).toEqual(updatedList);
  });

  it('should throw when list or item is not found', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn(),
      setItemPurchasedForUser: jest.fn().mockResolvedValue(null),
    };
    const handler = new SetGroceryItemPurchasedStatusHandler(repository);

    await expect(
      handler.execute(
        new SetGroceryItemPurchasedStatusCommand(
          'list-id',
          'missing-item',
          true,
          user,
        ),
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
