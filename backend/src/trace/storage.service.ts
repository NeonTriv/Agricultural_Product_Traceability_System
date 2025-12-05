import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      order: { id: 'ASC' },
    });

    return warehouses.map((w) => ({
      id: w.id,
      capacity: w.capacity,
      storeCondition: w.storeCondition,
    }));
  }

  async getWarehouse(id: number) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return {
      id: warehouse.id,
      capacity: warehouse.capacity,
      storeCondition: warehouse.storeCondition,
    };
  }

  async createWarehouse(data: {
    id: number;
    capacity?: number;
    storeCondition?: string;
  }) {
    const warehouse = this.warehouseRepo.create({
      id: data.id,
      capacity: data.capacity,
      storeCondition: data.storeCondition,
    });

    await this.warehouseRepo.save(warehouse);

    return { success: true, id: warehouse.id };
  }

  async updateWarehouse(
    id: number,
    data: {
      capacity?: number;
      storeCondition?: string;
    },
  ) {
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    if (data.capacity !== undefined) warehouse.capacity = data.capacity;
    if (data.storeCondition !== undefined) warehouse.storeCondition = data.storeCondition;

    await this.warehouseRepo.save(warehouse);

    return { success: true, id: warehouse.id };
  }

  async deleteWarehouse(id: number) {
    // Check if warehouse exists with relations
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // Check for stored items
    const storedItems = await this.storedInRepo.find({ where: { warehouseId: id } });
    if (storedItems.length > 0) {
      throw new BadRequestException(`Cannot delete warehouse. Please remove ${storedItems.length} stored item(s) first (tab Storage > Stored Items)`);
    }

    // Now safe to delete the warehouse
    await this.warehouseRepo.delete({ id });

    return { success: true };
  }

  // Stored In methods
  async getAllStoredIn() {
    const storedIns = await this.storedInRepo.find({
      relations: ['batch', 'batch.agricultureProduct'],
      order: { batchId: 'DESC' },
    });

    return storedIns.map((si) => ({
      batchId: si.batchId,
      warehouseId: si.warehouseId,
      quantity: si.quantity,
      batchQrCode: si.batch?.qrCodeUrl,
      productName: si.batch?.agricultureProduct?.name,
    }));
  }

  async getStoredIn(batchId: number, warehouseId: number) {
    const storedIn = await this.storedInRepo.findOne({
      where: { batchId, warehouseId },
      relations: ['batch', 'batch.agricultureProduct'],
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
      batchId: data.batchId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      // startDate: data.startDate ? new Date(data.startDate) : null, // Commented out - column may not exist in DB
      // endDate: data.endDate ? new Date(data.endDate) : null, // Commented out - column may not exist in DB
    });

    await this.storedInRepo.save(storedIn);

    return { success: true, batchId: storedIn.batchId, warehouseId: storedIn.warehouseId };
  }

  async updateStoredIn(
    batchId: number,
    warehouseId: number,
    data: {
      quantity?: number;
      startDate?: string;
      endDate?: string;
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
    // if (data.startDate !== undefined) {
    //   storedIn.startDate = data.startDate ? new Date(data.startDate) : null;
    // }
    // if (data.endDate !== undefined) {
    //   storedIn.endDate = data.endDate ? new Date(data.endDate) : null;
    // }

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
