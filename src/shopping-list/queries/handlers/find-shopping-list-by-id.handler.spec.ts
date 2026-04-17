import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { User } from '../../../shared/entities/user.entity';
import { ShoppingList } from '../../entities/shopping-list.entity';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import {
  FindShoppingListByIdHandler,
  FindShoppingListByIdQuery,
} from './find-shopping-list-by-id.handler';

describe('FindShoppingListByIdHandler', () => {
  const user = new User({
    _id: new Types.ObjectId(),
    email: 'owner@example.com',
    firstName: 'Owner',
    lastName: 'User',
  });

  it('should fetch the shopping list for the current user', async () => {
    const expectedList = new ShoppingList({
      _id: 'list-id',
      name: 'Weekly',
      items: [],
    });
    const findByIdForUser = jest.fn().mockResolvedValue(expectedList);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser,
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
    };
    const handler = new FindShoppingListByIdHandler(repository);

    const result = await handler.execute(
      new FindShoppingListByIdQuery('list-id', user),
    );

    expect(findByIdForUser).toHaveBeenCalledWith(
      'list-id',
      user._id.toString(),
    );
    expect(result).toEqual(expectedList);
  });

  it('should throw when the shopping list does not belong to the current user', async () => {
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser: jest.fn(),
      findByIdForUser: jest.fn().mockResolvedValue(null),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
    };
    const handler = new FindShoppingListByIdHandler(repository);

    await expect(
      handler.execute(new FindShoppingListByIdQuery('missing-id', user)),
    ).rejects.toThrow(NotFoundException);
  });
});
