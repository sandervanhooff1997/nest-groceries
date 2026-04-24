import { NotFoundException } from '@nestjs/common';
import { ShoppingListFactory, UserFactory } from '@common/factories';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  RemoveGroceryItemCommand,
  RemoveGroceryItemHandler,
} from './remove-grocery-item.handler';

describe('RemoveGroceryItemHandler', () => {
  const user = UserFactory.create();

  it('should remove an item from a user shopping list', async () => {
    const updatedList = ShoppingListFactory.create({
      _id: 'list-id',
      items: [],
    });

    const removeItemForUser = jest.fn().mockResolvedValue(updatedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllAccessibleByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addOwner: jest.fn(),
      addParticipant: jest.fn(),
      removeMember: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser,
      setItemPurchasedForUser: jest.fn(),
      reorderItemsForUser: jest.fn(),
      updateItemForUser: jest.fn(),
    };
    const handler = new RemoveGroceryItemHandler(repository);

    const result = await handler.execute(
      new RemoveGroceryItemCommand('list-id', 'item-id', user),
    );

    expect(removeItemForUser).toHaveBeenCalledWith('list-id', user, 'item-id');
    expect(result).toEqual(updatedList);
  });

  it('should throw when list or item is not found', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllAccessibleByUser: jest.fn(),
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
      addOwner: jest.fn(),
      addParticipant: jest.fn(),
      removeMember: jest.fn(),
      addItemForUser: jest.fn(),
      removeItemForUser: jest.fn().mockResolvedValue(null),
      setItemPurchasedForUser: jest.fn(),
      reorderItemsForUser: jest.fn(),
      updateItemForUser: jest.fn(),
    };
    const handler = new RemoveGroceryItemHandler(repository);

    await expect(
      handler.execute(
        new RemoveGroceryItemCommand('list-id', 'missing-item', user),
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
