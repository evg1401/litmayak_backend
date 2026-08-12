import { Roles, Permissions } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Roles) protected rolesRepository: typeof Roles) {}

  async getRolePermissions(roleId: number): Promise<Permissions[]> {
    const roles = await this.rolesRepository.findByPk(roleId, {
      attributes: ['id'],
      include: [Permissions],
    });

    if (!roles?.permissions || roles?.permissions?.length === 0) {
      return [];
    }

    return roles.toJSON().permissions;
  }

  async getRoleByCode(code: string): Promise<Roles | null> {
    return await this.rolesRepository.findOne({ where: { code } });
  }
}
