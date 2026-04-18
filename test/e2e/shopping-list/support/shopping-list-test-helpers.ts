import request from 'supertest';
import { GroceryItemUnit } from '@shopping-list/enums/grocery-item-unit.enum';

export interface GroceryItemResponse {
  _id: string;
  name: string;
  quantity?: number;
  unit?: string;
  purchased?: boolean;
}

export interface ShoppingListResponse {
  _id: string;
  name: string;
  nextId?: string;
  items: GroceryItemResponse[];
  createdBy?: string;
  updatedBy?: string;
}

export async function createShoppingList(
  httpServer: Parameters<typeof request>[0],
  payload: {
    name: string;
    items: Array<{
      name: string;
      quantity?: number;
      unit?: GroceryItemUnit;
      purchased?: boolean;
    }>;
  },
): Promise<ShoppingListResponse> {
  const response = await request(httpServer)
    .post('/api/shopping-lists')
    .send(payload)
    .expect(201);

  return response.body as ShoppingListResponse;
}

export async function createEmptyShoppingList(
  httpServer: Parameters<typeof request>[0],
): Promise<ShoppingListResponse> {
  return await createShoppingList(httpServer, {
    name: 'Items list',
    items: [],
  });
}

export async function createShoppingListWithSingleItem(
  httpServer: Parameters<typeof request>[0],
): Promise<ShoppingListResponse> {
  return await createShoppingList(httpServer, {
    name: 'Purchase list',
    items: [
      {
        name: 'Orange Juice',
        quantity: 1,
        unit: GroceryItemUnit.LITER,
        purchased: false,
      },
    ],
  });
}
