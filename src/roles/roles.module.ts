import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from '@models';

@Module({
  imports: [SequelizeModule.forFeature([Roles])],
  controllers: [],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
