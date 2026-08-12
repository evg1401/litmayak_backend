import { PublishingHouses } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreatePublishingHousesRequestDto,
  UpdatePublishingHousesRequestDto,
} from './dto/publishing_houses.request.dto';

@Injectable()
export class PublishingHousesService {
  constructor(
    @InjectModel(PublishingHouses)
    protected publishingHousesRepository: typeof PublishingHouses,
  ) {}

  async create(request: CreatePublishingHousesRequestDto) {
    return this.publishingHousesRepository.create({ ...request });
  }

  async update(
    id: number,
    request: UpdatePublishingHousesRequestDto,
  ): Promise<number> {
    const result = await this.publishingHousesRepository.update(
      { ...request },
      { where: { id } },
    );

    return result[0];
  }
}
