import request from 'supertest';
import {
  createShoppingListE2eApp,
  E2E_SHOPPING_LIST_USER,
} from '@test/e2e/shopping-list/support/shopping-list-test-app';
import { registerE2eAppLifecycle } from '@test/e2e/helpers/e2e-test-helpers';
import {
  createShoppingList,
  type ShoppingListResponse,
} from '@test/e2e/shopping-list/support/shopping-list-test-helpers';

describe('ShoppingListActionsController (e2e)', () => {
  const e2e = registerE2eAppLifecycle(createShoppingListE2eApp, __filename);

  it('should duplicate a shopping list and link nextId to source list id', async () => {
    const source = await createShoppingList(e2e.httpServer(), {
      name: 'Duplication source',
      items: [{ name: 'Bread', purchased: false }],
    });

    const duplicateResponse = await request(e2e.httpServer())
      .post(`/api/shopping-lists/${source._id}/duplicate`)
      .expect(201);

    const duplicated = duplicateResponse.body as ShoppingListResponse;

    expect(duplicated._id).not.toBe(source._id);
    expect(duplicated.name).toBe(source.name);
    expect(duplicated.nextId).toBe(source._id);
    expect(duplicated.items).toHaveLength(source.items.length);
    expect(duplicated.createdBy).toBe(E2E_SHOPPING_LIST_USER.userId);

    const sourceAfterDuplication = await request(e2e.httpServer())
      .get(`/api/shopping-lists/${source._id}`)
      .expect(200);

    const sourceBody = sourceAfterDuplication.body as ShoppingListResponse;
    expect(sourceBody.nextId).toBeUndefined();
  });

  it('should return 404 when duplicating a missing shopping list', async () => {
    await request(e2e.httpServer())
      .post('/api/shopping-lists/507f1f77bcf86cd799439011/duplicate')
      .expect(404);
  });

  it('should duplicate only the selected item ids when provided', async () => {
    const source = await createShoppingList(e2e.httpServer(), {
      name: 'Selective duplication source',
      items: [
        { name: 'Bread', purchased: false },
        { name: 'Eggs', purchased: false },
      ],
    });

    const selectedItemId = source.items[1]?._id;
    if (!selectedItemId) {
      throw new Error('Expected second source item id to be present');
    }

    const duplicateResponse = await request(e2e.httpServer())
      .post(`/api/shopping-lists/${source._id}/duplicate`)
      .send({ itemIds: [selectedItemId] })
      .expect(201);

    const duplicated = duplicateResponse.body as ShoppingListResponse;

    expect(duplicated.items).toHaveLength(1);
    expect(duplicated.items[0]?._id).toBe(selectedItemId);
    expect(duplicated.nextId).toBe(source._id);
  });
});
