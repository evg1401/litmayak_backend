import { getOffsetFromPage } from '@/helpers';
import {
  CreationAttributes,
  FindAttributeOptions,
  FindOptions,
  Includeable,
  Model,
  ModelStatic,
  Order,
} from 'sequelize';

export abstract class CrudService<T extends Model<T>> {
  declare protected model: ModelStatic<T>;

  async create(items: CreationAttributes<T>): Promise<T> {
    return this.model.create(items);
  }

  async createBatch(items: CreationAttributes<T>[]): Promise<number> {
    return (await this.model.bulkCreate(items)).length;
  }

  async getListAll(
    attrs: string[] = [],
    excAttrs: string[] = [],
    order: Order = [['id', 'ASC']],
    include: Includeable[] = [],
  ): Promise<T[]> {
    let attributes: FindAttributeOptions | undefined;

    if (excAttrs.length === 0) {
      attributes = this.validateAttrs(attrs);
    } else {
      attributes = {
        include: this.validateAttrs(attrs),
        exclude: this.validateAttrs(excAttrs) ?? [],
      };
    }

    return this.model.findAll({
      order,
      attributes,
      include,
    });
  }

  async getList(
    page: number = 1,
    limit: number = 100,
    attrs: string[] = [],
    order: Order = [['id', 'ASC']],
    include: Includeable[] = [],
  ): Promise<T[]> {
    return this.model.findAll({
      offset: getOffsetFromPage(page, limit),
      limit,
      order,
      attributes: {
        include: this.validateAttrs(attrs),
        exclude: ['authorId', 'updatedAt'],
      },
      include,
    });
  }

  async getByid(id: number, options?: FindOptions<T>): Promise<T | null> {
    return this.model.findByPk(id, options);
  }

  async getItem(options: FindOptions<T>): Promise<T | null> {
    return this.model.findOne(options);
  }

  async countListItems(): Promise<number> {
    return this.model.count();
  }

  async clearAll(): Promise<void> {
    await this.model.truncate();
  }

  async delete(options: FindOptions<T>): Promise<number> {
    return this.model.destroy(options);
  }

  protected validateFieldsBeforeUpdate(
    items: Record<string, any>,
  ): Record<string, any> {
    const result = {};

    for (const key in items) {
      if (this.model.getAttributes()[key]) {
        result[key] = items[key];
      }
    }

    return result;
  }

  protected validateAttrs(attrs: string[]): string[] | undefined {
    if (attrs.length === 0) return;

    const result: string[] = [];

    for (let index = 0; index < attrs.length; index++) {
      const attr = attrs[index];

      if (this.model.getAttributes()[attr]) {
        result.push(attr);
      }
    }

    return result;
  }
}
