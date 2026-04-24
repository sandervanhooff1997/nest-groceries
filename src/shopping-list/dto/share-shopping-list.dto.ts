import { IsEmail, IsIn } from 'class-validator';

export class ShareShoppingListDto {
  @IsEmail()
  userEmail: string;

  @IsIn(['co-owner', 'participant'])
  role: 'co-owner' | 'participant';
}
