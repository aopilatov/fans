import { IsOptional, IsNumber } from 'class-validator';

export class SubscriptionChangeDto {
  @IsOptional() @IsNumber()
  level: number;
}
