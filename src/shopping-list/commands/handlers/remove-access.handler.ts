import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';
import { UserService } from '@shared/services/user.service';

export class RemoveAccessCommand implements IAuditable {
  constructor(
    public readonly listId: string,
    public readonly userEmail: string,
    public readonly user: User,
  ) {}
}

@CommandHandler(RemoveAccessCommand)
export class RemoveAccessHandler implements ICommandHandler<RemoveAccessCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(command: RemoveAccessCommand) {
    const list = await this.repository.findById(command.listId);
    if (!list) {
      throw new NotFoundException('Shopping list not found');
    }

    if (list.createdBy !== command.user.userId) {
      throw new ForbiddenException('Only the creator can manage access');
    }

    const targetUser = await this.userService.getUserByEmail(command.userEmail);
    if (!targetUser?._id) {
      throw new NotFoundException(
        `User with email ${command.userEmail} not found`,
      );
    }

    return await this.repository.removeMember(
      command.listId,
      targetUser._id,
      command.user,
    );
  }
}
