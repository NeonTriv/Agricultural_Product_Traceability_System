import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vegetable } from './vegetable.entity';
import { EditPayload, EditType } from './vegetable.enum';

@Injectable()
export class VegetableService {
  constructor(
    @InjectRepository(Vegetable)
    private readonly VegetableRepo: Repository<Vegetable>,
  ) {}

  async create(Name: string, Quantity: number): Promise<Vegetable> {
    const entity = this.VegetableRepo.create({ Name, Quantity });
    return this.VegetableRepo.save(entity);
  }

  async findAll(): Promise<Vegetable[]> {
    return this.VegetableRepo.find();
  }

  async findOne(ID: number): Promise<Vegetable> {
    const vegetable = await this.VegetableRepo.findOneBy({ ID });
    if (!vegetable) throw new NotFoundException('Vegetable not found');
    return vegetable;
  }

  async updateByType(ID: number, body: EditPayload): Promise<Vegetable> {
    const vegetable = await this.findOne(ID); // Reuse findOne to handle not found case

    switch (body.editType) {
      case EditType.Rename:
        vegetable.Name = body.name.trim();
        break;
      case EditType.SetQuantity:
        vegetable.Quantity = Number(body.quantity);
        break;
      case EditType.IncQuantity:
        vegetable.Quantity = (vegetable.Quantity ?? 0) + Number(body.by);
        break;
      case EditType.DecQuantity:
        vegetable.Quantity = Math.max(0, (vegetable.Quantity ?? 0) - Number(body.by));
        break;
    }

    return this.VegetableRepo.save(vegetable);
  }

  async remove(ID: number): Promise<void> {
    const vegetable = await this.findOne(ID); // Reuse findOne to handle not found case
    if (vegetable) {
      await this.VegetableRepo.remove(vegetable);
      return Promise.resolve();
    } else {
      throw new NotFoundException('Vegetable not found');
    }
  }
}