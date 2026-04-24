import { IsEmail } from 'class-validator';

export class RemoveAccessDto {
  @IsEmail()
  userEmail: string;
}
