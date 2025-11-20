import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MoveMenuDTO } from '../dto/move-menu.dto';
import { ReorderMenuDTO } from '../dto/reorder-menu.dto';

@Controller('api/menus')
export class MenuController {
  constructor(private service: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Create new menu item' })
  create(@Body() createMenuDTO: CreateMenuDto) {
    return this.service.create(createMenuDTO);
  }

  @Get()
  @ApiOperation({ summary: 'Find all item' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find item by Id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update item by Id' })
  update(@Param('id') id: string, @Body() updateMenuDTO: UpdateMenuDto) {
    return this.service.update(id, updateMenuDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item by Id' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move item between parent' })
  move(@Param('id') id: string, @Body() moveMenuDTO: MoveMenuDTO) {
    return this.service.move(id, moveMenuDTO);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Just Reorder' })
  reorder(@Param('id') id: string, @Body() reorderMenuDTO: ReorderMenuDTO) {
    return this.service.reorder(id, reorderMenuDTO);
  }
}
