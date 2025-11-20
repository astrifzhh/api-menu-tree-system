import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ description: 'Menu name', example: 'System Management' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Menu URL',
    example: '/systems',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @ApiProperty({
    description: 'Menu icon',
    example: 'settings',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiProperty({
    description: 'Parent menu ID',
    example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a9',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Sort order', example: 0, required: false })
  @IsNumber()
  @Min(0)
  sortOrder: number;

  @ApiProperty({
    description: 'Is menu active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
