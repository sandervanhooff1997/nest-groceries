import request from 'supertest';
import { GroceryItemUnit } from '@shopping-list/enums/grocery-item-unit.enum';
import { createShoppingListE2eApp } from '@test/e2e/shopping-list/support/shopping-list-test-app';
import { registerE2eAppLifecycle } from '@test/e2e/helpers/e2e-test-helpers';
import {
  createEmptyShoppingList,
  type ShoppingListResponse,
} from '@test/e2e/shopping-list/support/shopping-list-test-helpers';

describe('GroceryItemsController (e2e)', () => {
  const e2e = registerE2eAppLifecycle(createShoppingListE2eApp, __filename);

  it('should add and remove grocery items by id', async () => {
    const shoppingList = await createEmptyShoppingList(e2e.httpServer());

    const addResponse = await request(e2e.httpServer())
      .post(`/api/shopping-lists/${shoppingList._id}/items`)
      .send({
        name: 'Tomatoes',
        quantity: 500,
        unit: GroceryItemUnit.GRAM,
        purchased: false,
      })
      .expect(201);

    const listWithItem = addResponse.body as ShoppingListResponse;
    const addedItem = listWithItem.items[0];

    expect(addedItem?.name).toBe('Tomatoes');
    expect(addedItem?._id).toEqual(expect.any(String));

    const removeResponse = await request(e2e.httpServer())
      .delete(`/api/shopping-lists/${shoppingList._id}/items/${addedItem?._id}`)
      .expect(200);

    const listAfterRemoval = removeResponse.body as ShoppingListResponse;
    expect(listAfterRemoval.items).toHaveLength(0);
  });

  it('should return 404 when removing an unknown grocery item', async () => {
    const shoppingList = await createEmptyShoppingList(e2e.httpServer());

    await request(e2e.httpServer())
      .delete(
        `/api/shopping-lists/${shoppingList._id}/items/507f1f77bcf86cd799439012`,
      )
      .expect(404);
  });
});
