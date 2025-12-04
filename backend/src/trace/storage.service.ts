import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { StoredIn } from './entities/stored-in.entity';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(StoredIn)
    private readonly storedInRepo: Repository<StoredIn>,
  ) {}

  // Warehouse methods
  async getAllWarehouses() {
    const warehouses = await this.warehouseRepo.find({
      relations: ['storedInRecords'],
      order: { id: 'ASC' },
    });

    return warehouses.map((w) => ({
      id: w.id,
      address: w.address,
      storeCondition: w.storeCondition,
      startDate: w.startDate,
      endDate: w.endDate,
      storedInCount: w.storedInRecords?.length || 0,
    }));
  }

  async getWarehouse(id: number) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { id },
      relations: ['storedInRecords'],
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return {
      id: warehouse.id,
      address: warehouse.address,
      storeCondition: warehouse.storeCondition,
      startDate: warehouse.startDate,
      endDate: warehouse.endDate,
      storedInCount: warehouse.storedInRecords?.length || 0,
    };
  }

  async createWarehouse(data: {
    id: number;
    address: string;
    storeCondition?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const warehouse = this.warehouseRepo.create({
      id: data.id,
      address: data.address,
      storeCondition: data.storeCondition,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    });

    await this.warehouseRepo.save(warehouse);

    return { success: true, id: warehouse.id };
  }

  async updateWarehouse(
    id: number,
    data: {
      address?: string;
      storeCondition?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    if (data.address) warehouse.address = data.address;
    if (data.storeCondition !== undefined) warehouse.storeCondition = data.storeCondition;
    if (data.startDate !== undefined) {
      warehouse.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      warehouse.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    await this.warehouseRepo.save(warehouse);

    return { success: true, id: warehouse.id };
  }

  async deleteWarehouse(id: number) {
    const result = await this.warehouseRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return { success: true };
  }

  // Stored In methods
  async getAllStoredIn() {
    const storedIns = await this.storedInRepo.find({
      relations: ['batch', 'batch.agricultureProduct', 'warehouse'],
      order: { batchId: 'DESC' },
    });

    return storedIns.map((si) => ({
      batchId: si.batchId,
      warehouseId: si.warehouseId,
      quantity: si.quantity,
      batchQrCode: si.batch?.qrCodeUrl,
      productName: si.batch?.agricultureProduct?.name,
      warehouseAddress: si.warehouse?.address,
    }));
  }

  async getStoredIn(batchId: number, warehouseId: number) {
    const storedIn = await this.storedInRepo.findOne({
      where: { batchId, warehouseId },
      relations: ['batch', 'batch.agricultureProduct', 'warehouse'],
    });

    if (!storedIn) {
      throw new NotFoundException(
        `Stored In record for Batch ${batchId} and Warehouse ${warehouseId} not found`,
      );
    }

    return {
      batchId: storedIn.batchId,
      warehouseId: storedIn.warehouseId,
      quantity: storedIn.quantity,
      batchQrCode: storedIn.batch?.qrCodeUrl,
      productName: storedIn.batch?.agricultureProduct?.name,
      warehouseAddress: storedIn.warehouse?.address,
    };
  }

  async createStoredIn(data: {
    batchId: number;
    warehouseId: number;
    quantity: number;
  }) {
    const storedIn = this.storedInRepo.create({
      batchId: data.batchId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
    });

    await this.storedInRepo.save(storedIn);

    return { success: true, batchId: storedIn.batchId, warehouseId: storedIn.warehouseId };
  }

  async updateStoredIn(
    batchId: number,
    warehouseId: number,
    data: {
      quantity?: number;
    },
  ) {
    const storedIn = await this.storedInRepo.findOne({
      where: { batchId, warehouseId },
    });

    if (!storedIn) {
      throw new NotFoundException(
        `Stored In record for Batch ${batchId} and Warehouse ${warehouseId} not found`,
      );
    }

    if (data.quantity !== undefined) storedIn.quantity = data.quantity;

    await this.storedInRepo.save(storedIn);

    return { success: true, batchId: storedIn.batchId, warehouseId: storedIn.warehouseId };
  }

  async deleteStoredIn(batchId: number, warehouseId: number) {
    const result = await this.storedInRepo.delete({ batchId, warehouseId });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Stored In record for Batch ${batchId} and Warehouse ${warehouseId} not found`,
      );
    }

    return { success: true };
  }
}
