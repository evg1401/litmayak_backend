import { Module } from '@nestjs/common';
import { AuthorsService } from '@/profile/authors/authors.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Authors, Roles, Users } from '@models';
import { AuthorsController } from './authors.controller';
import { RolesService } from '@/roles/roles.service';
import { UsersService } from '@/profile/users/users.service';

@Module({
  imports: [SequelizeModule.forFeature([Users, Authors, Roles])],
  controllers: [AuthorsController],
  providers: [AuthorsService, RolesService, UsersService],
})
export class AuthorsModule {}
