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
    const warehouse = await this.warehouseRepo.findOne({
      where: { id },
      relations: ['province', 'province.country'],
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

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

  async createWarehouse(data: {
    capacity?: number;
    storeCondition?: string;
    addressDetail: string;
    longitude?: number;
    latitude?: number;
    provinceId: number;
  }) {
    const warehouse = this.warehouseRepo.create({
      capacity: data.capacity,
      storeCondition: data.storeCondition,
      addressDetail: data.addressDetail,
      longitude: data.longitude,
      latitude: data.latitude,
      provinceId: data.provinceId,
    });

    await this.warehouseRepo.save(warehouse);

    return { success: true, id: warehouse.id };
  }

  async updateWarehouse(
    id: number,
    data: {
      capacity?: number;
      storeCondition?: string;
      addressDetail?: string;
      longitude?: number;
      latitude?: number;
      provinceId?: number;
    },
  ) {
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    if (data.capacity !== undefined) warehouse.capacity = data.capacity;
    if (data.storeCondition !== undefined) warehouse.storeCondition = data.storeCondition;
    if (data.addressDetail !== undefined) warehouse.addressDetail = data.addressDetail;
    if (data.longitude !== undefined) warehouse.longitude = data.longitude;
    if (data.latitude !== undefined) warehouse.latitude = data.latitude;
    if (data.provinceId !== undefined) warehouse.provinceId = data.provinceId;

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
      throw new BadRequestException(
        `Cannot delete Warehouse: It has ${storedItems.length} stored item(s). ` +
        `Please remove them first (Storage > Stored Items).`
      );
    }

    // Now safe to delete the warehouse
    await this.warehouseRepo.delete({ id });

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
      throw new NotFoundException(
        `Stored In record for Batch ${batchId} and Warehouse ${warehouseId} not found`,
      );
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
      batchId: data.batchId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
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
    if (data.startDate !== undefined) {
      storedIn.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      storedIn.endDate = data.endDate ? new Date(data.endDate) : null;
    }

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
