import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IShoppingListRepository } from '../../constants/shopping-list.constants';
import type { IShoppingListRepository as ShoppingListRepositoryPort } from '../../interfaces/shopping-list.repository.interface';
import type { IAuditable } from '@shared/interfaces/auditable.interface';
import type { User } from '@shared/entities/user.entity';
import { UserService } from '@shared/services/user.service';

export class ShareShoppingListCommand implements IAuditable {
  constructor(
    public readonly listId: string,
    public readonly userEmail: string,
    public readonly role: 'co-owner' | 'participant',
    public readonly user: User,
  ) {}
}

@CommandHandler(ShareShoppingListCommand)
export class ShareShoppingListHandler implements ICommandHandler<ShareShoppingListCommand> {
  constructor(
    @Inject(IShoppingListRepository)
    private readonly repository: ShoppingListRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(command: ShareShoppingListCommand) {
    const list = await this.repository.findById(command.listId);
    if (!list) {
      throw new NotFoundException('Shopping list not found');
    }

    if (list.createdBy !== command.user.userId) {
      throw new ForbiddenException('Only the creator can share this list');
    }

    const targetUser = await this.userService.getUserByEmail(command.userEmail);
    if (!targetUser?._id) {
      throw new NotFoundException(
        `User with email ${command.userEmail} not found`,
      );
    }

    if (targetUser.userId === command.user.userId) {
      throw new ForbiddenException('Cannot share with yourself');
    }

    if (command.role === 'co-owner') {
      return await this.repository.addOwner(
        command.listId,
        targetUser._id,
        command.user,
      );
    }
    return await this.repository.addParticipant(
      command.listId,
      targetUser._id,
      command.user,
    );
  }
}
