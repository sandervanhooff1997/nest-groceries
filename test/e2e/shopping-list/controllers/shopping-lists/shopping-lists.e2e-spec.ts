import request from 'supertest';
import { GroceryItemUnit } from '@shopping-list/enums/grocery-item-unit.enum';
import {
  createShoppingListE2eApp,
  E2E_SHOPPING_LIST_USER,
} from '@test/e2e/shopping-list/support/shopping-list-test-app';
import { registerE2eAppLifecycle } from '@test/e2e/helpers/e2e-test-helpers';
import type { ShoppingListResponse } from '@test/e2e/shopping-list/support/shopping-list-test-helpers';

describe('ShoppingListsController (e2e)', () => {
  const e2e = registerE2eAppLifecycle(createShoppingListE2eApp, __filename);

  it('should create, list, find, update and delete a shopping list', async () => {
    const createResponse = await request(e2e.httpServer())
      .post('/api/shopping-lists')
      .send({
        name: 'Weekly groceries',
        items: [
          {
            name: 'Milk',
            quantity: 2,
            unit: GroceryItemUnit.LITER,
            purchased: false,
          },
        ],
      })
      .expect(201);

    const createdList = createResponse.body as ShoppingListResponse;

    expect(createdList.name).toBe('Weekly groceries');
    expect(createdList.items).toHaveLength(1);
    expect(createdList.createdBy).toBe(E2E_SHOPPING_LIST_USER._id.toString());

    const listResponse = await request(e2e.httpServer())
      .get('/api/shopping-lists')
      .expect(200);

    const shoppingLists = listResponse.body as ShoppingListResponse[];

    expect(shoppingLists).toHaveLength(1);
    expect(shoppingLists[0]?._id).toBe(createdList._id);

    const byIdResponse = await request(e2e.httpServer())
      .get(`/api/shopping-lists/${createdList._id}`)
      .expect(200);

    const foundById = byIdResponse.body as ShoppingListResponse;

    expect(foundById._id).toBe(createdList._id);
    expect(foundById.items[0]?.name).toBe('Milk');

    const updateResponse = await request(e2e.httpServer())
      .patch(`/api/shopping-lists/${createdList._id}`)
      .send({
        name: 'Updated groceries',
      })
      .expect(200);

    const updatedList = updateResponse.body as ShoppingListResponse;

    expect(updatedList.name).toBe('Updated groceries');

    const deleteResponse = await request(e2e.httpServer())
      .delete(`/api/shopping-lists/${createdList._id}`)
      .expect(200);

    const deletedList = deleteResponse.body as ShoppingListResponse;

    expect(deletedList._id).toBe(createdList._id);

    await request(e2e.httpServer())
      .get(`/api/shopping-lists/${createdList._id}`)
      .expect(404);
  });

  it('should reject invalid create payloads', async () => {
    await request(e2e.httpServer())
      .post('/api/shopping-lists')
      .send({
        name: '',
        items: 'not-an-array',
      })
      .expect(400);
  });
});
