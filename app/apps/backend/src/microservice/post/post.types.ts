import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class PostCreateDto {
  @IsNumber()
  level: number;

  @IsOptional()
  @IsString()
  text: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  images: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  videos: string[];
}

export class PostEditDto extends PostCreateDto {
  @IsUUID()
  uuid: string;
}
