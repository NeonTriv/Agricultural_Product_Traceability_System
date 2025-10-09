import { Injectable } from '@nestjs/common';
import { Vegetable } from './vegetable.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VegetableService {
  constructor(
    @InjectRepository(Vegetable)
    private readonly VegetableRepo: Repository<Vegetable>,
  ) {}

    async create(Name: string, Quantity: number): Promise<Vegetable> {
        const Vegetable = this.VegetableRepo.create({ Name: Name, Quantity: Quantity });
        return this.VegetableRepo.save(Vegetable);
    }

    async findAll(): Promise<Vegetable[]> {
        return this.VegetableRepo.find();
    }

    async findOne(ID : number): Promise<Vegetable> {
        const vegetable = await this.VegetableRepo.findOneBy({ ID: ID });
        
        if (!vegetable) {
            throw new Error('Vegetable not found');
        }
        return vegetable;
    }
  }