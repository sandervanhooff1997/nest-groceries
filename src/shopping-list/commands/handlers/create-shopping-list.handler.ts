import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import { ShoppingList } from '@shopping-list/entities/shopping-list.entity';
import { GroceryItem } from '@shopping-list/entities/grocery-item.entity';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';

export class CreateShoppingListCommand implements IAuditable {
  constructor(
    public readonly shoppingList: ShoppingList,
    public readonly user: User,
    public readonly fromTemplateId?: string,
    public readonly fromTemplateIds?: string[],
  ) {}
}

@CommandHandler(CreateShoppingListCommand)
export class CreateShoppingListHandler implements ICommandHandler<CreateShoppingListCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
  ) {}

  async execute(command: CreateShoppingListCommand) {
    let items = command.shoppingList.items;

    // Multi-template support
    if (command.fromTemplateIds && command.fromTemplateIds.length > 0) {
      const allItems: GroceryItem[] = [];
      for (const templateId of command.fromTemplateIds) {
        const template = await this.repository.findByIdForUser(
          templateId,
          command.user,
        );
        if (!template) {
          throw new NotFoundException(`Template not found: ${templateId}`);
        }
        allItems.push(
          ...template.items.map(
            (item) =>
              new GroceryItem({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                purchased: false,
                order: item.order,
              }),
          ),
        );
      }
      items = allItems;
    } else if (command.fromTemplateId) {
      const template = await this.repository.findByIdForUser(
        command.fromTemplateId,
        command.user,
      );
      if (!template) {
        throw new NotFoundException('Template not found');
      }
      items = template.items.map(
        (item) =>
          new GroceryItem({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            purchased: false,
            order: item.order,
          }),
      );
    }

    const shoppingList = new ShoppingList({
      ...command.shoppingList,
      items,
      createdBy: command.user.userId,
      updatedBy: command.user.userId,
    });

    return await this.repository.create(shoppingList);
  }
}
