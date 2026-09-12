import { Module } from '@nestjs/common';
import { AuthorsService } from '@/profile/authors/authors.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Authors } from '@models';
import { AuthorsController } from './authors.controller';
import { RolesModule } from '@/roles/roles.module';
import { UsersModule } from '@/profile/users/users.module';

@Module({
  imports: [SequelizeModule.forFeature([Authors]), RolesModule, UsersModule],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
