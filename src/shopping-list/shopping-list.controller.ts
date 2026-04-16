import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ShoppingListService } from './services/shopping-list.service';
import type { IShoppingList } from './interfaces/shopping-list.interface';

@Controller('shopping-lists')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Post()
  create(@Body() shoppingList: IShoppingList) {
    return this.shoppingListService.create(shoppingList);
  }

  @Get()
  findAll() {
    return this.shoppingListService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.shoppingListService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() shoppingList: Partial<IShoppingList>,
  ) {
    return this.shoppingListService.update(id, shoppingList);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.shoppingListService.delete(id);
  }
}
