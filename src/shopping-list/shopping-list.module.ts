import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShoppingList,
  ShoppingListSchema,
} from './schemas/shopping-list.schema';
import { ShoppingListController } from './shopping-list.controller';
import { ShoppingListService } from './services/shopping-list.service';
import { ShoppingListRepository } from './repository/shopping-list.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
    ]),
  ],
  controllers: [ShoppingListController],
  providers: [ShoppingListService, ShoppingListRepository],
  exports: [ShoppingListRepository],
})
export class ShoppingListModule {}
