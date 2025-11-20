import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuEntity } from './menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MoveMenuDTO } from '../dto/move-menu.dto';
import { ReorderMenuDTO } from '../dto/reorder-menu.dto';
import { buildTree } from '../utils/tree.utils';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
  ) {}

  async create(createMenuDTO: CreateMenuDto) {
    if (createMenuDTO.parentId) {
      // If there are parentId on child, then find the parent
      const parent = await this.menuRepository.findOne({
        where: { id: createMenuDTO.parentId },
      });
      if (!parent) {
        // If the parent has not exist, throw this..
        throw new NotFoundException('Not Found');
      }
    }

    if (createMenuDTO.sortOrder == null) {
      const qb = this.menuRepository
        .createQueryBuilder('menu')
        .select('COALESCE(MAX(menu.sortOrder), -1)', 'max');

      // Filter by same parent group
      if (createMenuDTO.parentId) {
        qb.where('menu.parentId = :parentId', {
          parentId: createMenuDTO.parentId,
        });
      } else {
        qb.where('menu.parentId IS NULL');
      }

      const result = await qb.getRawOne<{ max: number }>();

      createMenuDTO.sortOrder = (result?.max ?? -1) + 1;
    }

    // Save data
    const menu = this.menuRepository.create(createMenuDTO);
    return this.menuRepository.save(menu);
  }

  async findAll() {
    const menus = await this.menuRepository.find({
      order: { sortOrder: 'ASC' },
    });
    const treeData = buildTree(menus);

    return treeData;
  }

  async findOne(id: string) {
    const menus = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menus) throw new NotFoundException(`Menu swith ID ${id} not found`);
    return menus;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    await this.findOne(id);
    await this.menuRepository.update(id, updateMenuDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        await this.remove(child.id);
      }
    }

    await this.menuRepository.softDelete(id);
    return { message: `Menu with ID ${id} deleted successfully` };
  }

  async move(id: string, moveMenuDto: MoveMenuDTO) {
    const menu = await this.menuRepository.findOne({ where: { id } });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const newParentId = moveMenuDto.parentId ?? null;
    const oldParentId = menu.parentId; // Simpan parent lama

    /**
     * STEP 1 — Hitung sortOrder untuk parent baru
     */
    let newSortOrder = moveMenuDto.sortOrder;

    if (newSortOrder == null) {
      const qb = this.menuRepository
        .createQueryBuilder('menu')
        .select('COALESCE(MAX(menu.sortOrder), -1)', 'max');

      if (newParentId !== null) {
        qb.where('menu.parentId = :parentId', { parentId: newParentId });
      } else {
        qb.where('menu.parentId IS NULL');
      }

      const result = (await qb.getRawOne()) as { max: number };
      newSortOrder = (result?.max ?? -1) + 1;
    }

    /**
     * STEP 2 — SHIFT SIBLINGS DI POSISI LAMA (Hapus gap)
     */
    if (oldParentId !== newParentId) {
      // Geser semua siblings di parent lama yang sortOrder-nya lebih tinggi
      await this.menuRepository
        .createQueryBuilder()
        .update()
        .set({
          sortOrder: () => 'sort_order - 1',
        })
        .where('parentId = :oldParentId', {
          oldParentId: oldParentId !== null ? oldParentId : null,
        })
        .andWhere('sortOrder > :currentSortOrder', {
          currentSortOrder: menu.sortOrder,
        })
        .andWhere('id != :id', { id })
        .execute();
    }

    /**
     * STEP 3 — SHIFT SIBLINGS DI POSISI BARU (Buat ruang)
     */
    if (newParentId !== null) {
      // Geser semua siblings di parent baru yang sortOrder >= newSortOrder
      await this.menuRepository
        .createQueryBuilder()
        .update()
        .set({
          sortOrder: () => 'sort_order + 1',
        })
        .where('parentId = :newParentId', { newParentId })
        .andWhere('sortOrder >= :newSortOrder', { newSortOrder })
        .andWhere('id != :id', { id })
        .execute();
    } else {
      // Jika pindah ke root
      await this.menuRepository
        .createQueryBuilder()
        .update()
        .set({
          sortOrder: () => 'sort_order + 1',
        })
        .where('parentId IS NULL')
        .andWhere('sortOrder >= :newSortOrder', { newSortOrder })
        .andWhere('id != :id', { id })
        .execute();
    }

    /**
     * STEP 4 — Update menu dengan data baru
     */
    menu.parentId = newParentId;
    menu.sortOrder = newSortOrder;

    await this.menuRepository.save(menu);

    return {
      id: menu.id,
      name: menu.name,
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
    };
  }

  async reorder(id: string, reorderMenuDTO: ReorderMenuDTO) {
    const menu = await this.menuRepository.findOne({ where: { id } });

    if (!menu) throw new NotFoundException('Menu not found');

    // Query from table menus as menu
    const qb = this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.parentId IS NULL');

    if (reorderMenuDTO.parentId !== null) {
      qb.where('menu.parentId = :parentId', {
        parentId: reorderMenuDTO.parentId,
      });
    }
    const items = await qb.orderBy('menu.sortOrder', 'ASC').getMany();

    const fromIndex = items.findIndex((i) => i.id === id);

    const [moved] = items.splice(fromIndex, 1);

    items.splice(reorderMenuDTO.sortOrder, 0, moved);

    items.forEach((item, index) => {
      item.sortOrder = index;
    });

    await this.menuRepository.save(items);

    return {
      message: 'Reordered successfully',
      id: menu.id,
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
    };
  }
}
