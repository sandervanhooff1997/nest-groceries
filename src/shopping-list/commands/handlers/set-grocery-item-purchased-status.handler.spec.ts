import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ShoppingListFactory, UserFactory } from '@common/factories';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  SetGroceryItemPurchasedStatusCommand,
  SetGroceryItemPurchasedStatusHandler,
} from './set-grocery-item-purchased-status.handler';

describe('SetGroceryItemPurchasedStatusHandler', () => {
  const user = UserFactory.create();

  const makeRepository = (
    overrides: Partial<jest.Mocked<IShoppingListRepository>> = {},
  ): jest.Mocked<IShoppingListRepository> => ({
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
    removeItemForUser: jest.fn(),
    setItemPurchasedForUser: jest.fn(),
    reorderItemsForUser: jest.fn(),
    updateItemForUser: jest.fn(),
    ...overrides,
  });

  it('should mark an item as purchased or not purchased', async () => {
    const list = ShoppingListFactory.create({
      _id: 'list-id',
      isTemplate: false,
    });
    const updatedList = ShoppingListFactory.create({ _id: 'list-id' });
    const setItemPurchasedForUser = jest.fn().mockResolvedValue(updatedList);
    const repository = makeRepository({
      findByIdForUser: jest.fn().mockResolvedValue(list),
      setItemPurchasedForUser,
    });
    const handler = new SetGroceryItemPurchasedStatusHandler(repository);

    const result = await handler.execute(
      new SetGroceryItemPurchasedStatusCommand(
        'list-id',
        'item-id',
        true,
        user,
      ),
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findByIdForUser).toHaveBeenCalledWith('list-id', user);
    expect(setItemPurchasedForUser).toHaveBeenCalledWith(
      'list-id',
      user,
      'item-id',
      true,
    );
    expect(result).toEqual(updatedList);
  });

  it('should throw when list is not found', async () => {
    const repository = makeRepository({
      findByIdForUser: jest.fn().mockResolvedValue(null),
    });
    const handler = new SetGroceryItemPurchasedStatusHandler(repository);

    await expect(
      handler.execute(
        new SetGroceryItemPurchasedStatusCommand(
          'list-id',
          'item-id',
          true,
          user,
        ),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw when list is a template', async () => {
    const templateList = ShoppingListFactory.create({
      _id: 'list-id',
      isTemplate: true,
    });
    const repository = makeRepository({
      findByIdForUser: jest.fn().mockResolvedValue(templateList),
    });
    const handler = new SetGroceryItemPurchasedStatusHandler(repository);

    await expect(
      handler.execute(
        new SetGroceryItemPurchasedStatusCommand(
          'list-id',
          'item-id',
          true,
          user,
        ),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw when item is not found within the list', async () => {
    const list = ShoppingListFactory.create({
      _id: 'list-id',
      isTemplate: false,
    });
    const repository = makeRepository({
      findByIdForUser: jest.fn().mockResolvedValue(list),
      setItemPurchasedForUser: jest.fn().mockResolvedValue(null),
    });
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
