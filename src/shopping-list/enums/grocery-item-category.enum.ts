export enum GroceryItemCategory {
  FruitsVegetables = 'fruits_vegetables',
  Bread = 'bread',
  MeatDeli = 'meat_deli',
  Cheese = 'cheese',
  Dairy = 'dairy',
  PastaRiceSauces = 'pasta_rice_sauces',
  BreakfastSnacks = 'breakfast_snacks',
  NonFoodPromotions = 'nonfood_promotions',
  Beverages = 'beverages',
  FrozenFoods = 'frozen_foods',
  Checkout = 'checkout',
}

export const CATEGORY_ORDER: Record<GroceryItemCategory, number> = {
  [GroceryItemCategory.FruitsVegetables]: 0,
  [GroceryItemCategory.Bread]: 1,
  [GroceryItemCategory.MeatDeli]: 2,
  [GroceryItemCategory.Cheese]: 3,
  [GroceryItemCategory.Dairy]: 4,
  [GroceryItemCategory.PastaRiceSauces]: 5,
  [GroceryItemCategory.BreakfastSnacks]: 6,
  [GroceryItemCategory.NonFoodPromotions]: 7,
  [GroceryItemCategory.Beverages]: 8,
  [GroceryItemCategory.FrozenFoods]: 9,
  [GroceryItemCategory.Checkout]: 10,
};

export const CATEGORY_LABELS: Record<GroceryItemCategory, string> = {
  [GroceryItemCategory.FruitsVegetables]: 'Fruit & Groente',
  [GroceryItemCategory.Bread]: 'Brood',
  [GroceryItemCategory.MeatDeli]: 'Vlees & Deli',
  [GroceryItemCategory.Cheese]: 'Kaas',
  [GroceryItemCategory.Dairy]: 'Zuivel',
  [GroceryItemCategory.PastaRiceSauces]: 'Pasta, Rijst & Sauzen',
  [GroceryItemCategory.BreakfastSnacks]: 'Ontbijt & Snacks',
  [GroceryItemCategory.NonFoodPromotions]: 'Huishouden & Promoties',
  [GroceryItemCategory.Beverages]: 'Dranken',
  [GroceryItemCategory.FrozenFoods]: 'Diepvries',
  [GroceryItemCategory.Checkout]: 'Kassa',
};
