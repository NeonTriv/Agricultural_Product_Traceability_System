import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vegetable } from './vegetable.entity';
import { EditType, UpdatePayload } from './vegetable.enum';

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

  private normalizeEditType(v: unknown): EditType | null {
  if (v == null) return null;
  const s = String(v).trim();
  const lower = s.toLowerCase();
  const map: Record<string, EditType> = {
    rename: EditType.Rename,
    setquantity: EditType.SetQuantity,
    incquantity: EditType.IncQuantity,
    '0': EditType.Rename,
    '1': EditType.SetQuantity,
    '2': EditType.IncQuantity,
  };
  return (EditType as any)[s] ?? map[lower] ?? null;
}

  async updateByType(ID: number, payload: UpdatePayload) {
  const v = await this.findOne(ID);

  const type = this.normalizeEditType(payload.type ?? payload.editType);
  if (!type) throw new BadRequestException(`Unsupported type/editType: ${String(payload.type ?? payload.editType)}`);

  const raw = payload.value ?? payload.name ?? payload.quantity ?? payload.by;

  switch (type) {
    case EditType.Rename: {
      const n = String(raw ?? '').trim();
      if (!n) throw new BadRequestException('value/name is required');
      v.Name = n;
      break;
    }
    case EditType.SetQuantity: {
      const q = Number(raw);
      if (!Number.isFinite(q) || q < 0) throw new BadRequestException('value/quantity must be >= 0');
      v.Quantity = q;
      break;
    }
    case EditType.IncQuantity: {
      const d = Number(raw ?? 1);
      if (!Number.isFinite(d) || d <= 0) throw new BadRequestException('value/by must be > 0');
      v.Quantity = (v.Quantity ?? 0) + d;
      break;
    }
  }

  return this.VegetableRepo.save(v);
}

  async remove(ID: number): Promise<void> {
    const vegetable = await this.findOne(ID);
    await this.VegetableRepo.remove(vegetable);
  }
}