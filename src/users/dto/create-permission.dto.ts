import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  module: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  resource?: string;
}

