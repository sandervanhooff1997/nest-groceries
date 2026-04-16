import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { ShoppingListModule } from './shopping-list/shopping-list.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nest-groceries',
    ),
    CqrsModule,
    ShoppingListModule,
  ],
})
export class AppModule {}
