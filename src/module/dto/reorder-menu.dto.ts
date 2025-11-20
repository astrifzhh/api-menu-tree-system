import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class ReorderMenuDTO {
  @ApiProperty({
    description: 'Parent menu ID',
    example: '56320ee9-6af6-11ed-a7ba-f220afe5e4a9',
    required: false,
  })
  @IsUUID()
  parentId: string;

  @ApiProperty({ description: 'Sort order', example: 0, required: false })
  @IsNumber()
  @Min(0)
  sortOrder: number;
}
