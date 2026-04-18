import request from 'supertest';
import { createShoppingListE2eApp } from '@test/e2e/shopping-list/support/shopping-list-test-app';
import { registerE2eAppLifecycle } from '@test/e2e/helpers/e2e-test-helpers';
import {
  createShoppingListWithSingleItem,
  type ShoppingListResponse,
} from '@test/e2e/shopping-list/support/shopping-list-test-helpers';

describe('GroceryItemActionsController (e2e)', () => {
  const e2e = registerE2eAppLifecycle(createShoppingListE2eApp, __filename);

  it('should complete and uncomplete a grocery item', async () => {
    const shoppingList = await createShoppingListWithSingleItem(
      e2e.httpServer(),
    );
    const item = shoppingList.items[0];

    const completeResponse = await request(e2e.httpServer())
      .patch(
        `/api/shopping-lists/${shoppingList._id}/items/${item?._id}/complete`,
      )
      .expect(200);

    const completedList = completeResponse.body as ShoppingListResponse;
    expect(completedList.items[0]?.purchased).toBe(true);

    const uncompleteResponse = await request(e2e.httpServer())
      .patch(
        `/api/shopping-lists/${shoppingList._id}/items/${item?._id}/uncomplete`,
      )
      .expect(200);

    const uncompletedList = uncompleteResponse.body as ShoppingListResponse;
    expect(uncompletedList.items[0]?.purchased).toBe(false);
  });

  it('should return 404 when toggling a missing grocery item', async () => {
    const shoppingList = await createShoppingListWithSingleItem(
      e2e.httpServer(),
    );

    await request(e2e.httpServer())
      .patch(
        `/api/shopping-lists/${shoppingList._id}/items/507f1f77bcf86cd799439012/complete`,
      )
      .expect(404);
  });
});
