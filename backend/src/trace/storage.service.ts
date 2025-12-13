import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../shared/base/base.service';
import { Warehouse } from './entities/warehouse.entity';
import { StoredIn } from './entities/stored-in.entity';

@Injectable()
export class StorageService extends BaseService<Warehouse> {
  constructor(
    @InjectRepository(Warehouse)
    warehouseRepo: Repository<Warehouse>,
    @InjectRepository(StoredIn)
    private readonly storedInRepo: Repository<StoredIn>,
  ) {
    super(warehouseRepo);
  }

  // Warehouse methods (using inherited BaseService methods)
  async getAllWarehouses() {
    const warehouses = await this.findAll({
      relations: ['province', 'province.country'],
      order: { id: 'ASC' },
    });

    return warehouses.map((w) => ({
      id: w.id,
      capacity: w.capacity,
      storeCondition: w.storeCondition,
      addressDetail: w.addressDetail,
      longitude: w.longitude,
      latitude: w.latitude,
      provinceId: w.provinceId,
      provinceName: w.province?.name || 'Unknown',
      countryName: w.province?.country?.name || 'Unknown',
    }));
  }

  async getWarehouse(id: number) {
    const warehouse = await this.findOne(id, ['province', 'province.country']);

    return {
      id: warehouse.id,
      capacity: warehouse.capacity,
      storeCondition: warehouse.storeCondition,
      addressDetail: warehouse.addressDetail,
      longitude: warehouse.longitude,
      latitude: warehouse.latitude,
      provinceId: warehouse.provinceId,
      provinceName: warehouse.province?.name || 'Unknown',
      countryName: warehouse.province?.country?.name || 'Unknown',
    };
  }

  async createWarehouse(data: Partial<Warehouse>) {
    const warehouse = await this.create(data);
    return { success: true, id: warehouse.id };
  }

  async updateWarehouse(id: number, data: Partial<Warehouse>) {
    const warehouse = await this.update(id, data);
    return { success: true, id: warehouse.id };
  }

  async deleteWarehouse(id: number) {
    // Check for dependencies before deleting
    const storedItems = await this.storedInRepo.find({ where: { warehouseId: id } });

    if (storedItems.length > 0) {
      throw new BadRequestException(
        `Cannot delete Warehouse: It has ${storedItems.length} stored item(s). ` +
        `Please remove them first.`
      );
    }

    await this.delete(id);
    return { success: true };
  }

  // Stored In methods (kept as-is for composite key handling)
  async getAllStoredIn() {
    const storedIns = await this.storedInRepo.find({
      relations: ['batch', 'batch.agricultureProduct', 'warehouse'],
      order: { batchId: 'DESC' },
    });

    return storedIns.map((si) => ({
      batchId: si.batchId,
      warehouseId: si.warehouseId,
      quantity: si.quantity,
      startDate: si.startDate ? new Date(si.startDate).toISOString().split('T')[0] : undefined,
      endDate: si.endDate ? new Date(si.endDate).toISOString().split('T')[0] : undefined,
      batchQrCode: si.batch?.qrCodeUrl,
      productName: si.batch?.agricultureProduct?.name,
      warehouseAddress: si.warehouse?.addressDetail,
    }));
  }

  async getStoredIn(batchId: number, warehouseId: number) {
    const storedIn = await this.storedInRepo.findOne({
      where: { batchId, warehouseId },
      relations: ['batch', 'batch.agricultureProduct', 'warehouse'],
    });

    if (!storedIn) {
      throw new BadRequestException(`Stored In record not found`);
    }

    return {
      batchId: storedIn.batchId,
      warehouseId: storedIn.warehouseId,
      quantity: storedIn.quantity,
      startDate: storedIn.startDate ? new Date(storedIn.startDate).toISOString().split('T')[0] : undefined,
      endDate: storedIn.endDate ? new Date(storedIn.endDate).toISOString().split('T')[0] : undefined,
      batchQrCode: storedIn.batch?.qrCodeUrl,
      productName: storedIn.batch?.agricultureProduct?.name,
      warehouseAddress: storedIn.warehouse?.addressDetail,
    };
  }

  async createStoredIn(data: {
    batchId: number;
    warehouseId: number;
    quantity: number;
    startDate?: string;
    endDate?: string;
  }) {
    const storedIn = this.storedInRepo.create({
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    });

    await this.storedInRepo.save(storedIn);
    return { success: true, batchId: storedIn.batchId, warehouseId: storedIn.warehouseId };
  }

  async updateStoredIn(
    batchId: number,
    warehouseId: number,
    data: { quantity?: number; startDate?: string; endDate?: string }
  ) {
    const storedIn = await this.storedInRepo.findOneOrFail({
      where: { batchId, warehouseId },
    });

    if (data.quantity !== undefined) storedIn.quantity = data.quantity;
    if (data.startDate !== undefined) storedIn.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) storedIn.endDate = data.endDate ? new Date(data.endDate) : null;

    await this.storedInRepo.save(storedIn);
    return { success: true, batchId, warehouseId };
  }

  async deleteStoredIn(batchId: number, warehouseId: number) {
    const result = await this.storedInRepo.delete({ batchId, warehouseId });

    if (result.affected === 0) {
      throw new BadRequestException(`Stored In record not found`);
    }

    return { success: true };
  }
}
