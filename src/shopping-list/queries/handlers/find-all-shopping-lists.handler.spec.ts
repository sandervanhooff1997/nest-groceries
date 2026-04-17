import { Types } from 'mongoose';
import { User } from '../../../shared/entities/user.entity';
import {
  FindAllShoppingListsHandler,
  FindAllShoppingListsQuery,
} from './find-all-shopping-lists.handler';
import type { IShoppingListRepository } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '../../entities/shopping-list.entity';

describe('FindAllShoppingListsHandler', () => {
  const user = new User({
    _id: new Types.ObjectId(),
    email: 'owner@example.com',
    firstName: 'Owner',
    lastName: 'User',
  });

  it('should only request shopping lists for the current user', async () => {
    const expectedLists = [
      new ShoppingList({ name: 'Weekly groceries', items: [] }),
    ];
    const findAllByUser = jest.fn().mockResolvedValue(expectedLists);
    const repository: jest.Mocked<IShoppingListRepository> = {
      create: jest.fn(),
      findAllByUser,
      findByIdForUser: jest.fn(),
      updateForUser: jest.fn(),
      deleteForUser: jest.fn(),
    };
    const handler = new FindAllShoppingListsHandler(repository);

    const result = await handler.execute(new FindAllShoppingListsQuery(user));

    expect(findAllByUser).toHaveBeenCalledWith(user._id.toString());
    expect(result).toEqual(expectedLists);
  });
});
