import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Processing } from './entities/processing.entity';
import { ProcessingFacility } from './entities/processing-facility.entity';

@Injectable()
export class ProcessingService {
  constructor(
    @InjectRepository(Processing)
    private readonly processingRepo: Repository<Processing>,
    @InjectRepository(ProcessingFacility)
    private readonly facilityRepo: Repository<ProcessingFacility>,
  ) {}

  // Processing Facilities methods
  async getAllFacilities() {
    const facilities = await this.facilityRepo.find({
      relations: ['processings'],
      order: { id: 'DESC' },
    });

    return facilities.map((f) => ({
      id: f.id,
      name: f.name,
      address: f.address,
      contactInfo: f.contactInfo,
      licenseNumber: f.licenseNumber,
      processingCount: f.processings?.length || 0,
    }));
  }

  async getFacility(id: number) {
    const facility = await this.facilityRepo.findOne({
      where: { id },
      relations: ['processings'],
    });

    if (!facility) {
      throw new NotFoundException(`Processing Facility with ID ${id} not found`);
    }

    return {
      id: facility.id,
      name: facility.name,
      address: facility.address,
      contactInfo: facility.contactInfo,
      licenseNumber: facility.licenseNumber,
      processingCount: facility.processings?.length || 0,
    };
  }

  async createFacility(data: {
    id: number;
    name: string;
    address: string;
    contactInfo?: string;
    licenseNumber: string;
  }) {
    const facility = this.facilityRepo.create({
      id: data.id,
      name: data.name,
      address: data.address,
      contactInfo: data.contactInfo,
      licenseNumber: data.licenseNumber,
    });

    await this.facilityRepo.save(facility);

    return { success: true, id: facility.id };
  }

  async updateFacility(
    id: number,
    data: {
      name?: string;
      address?: string;
      contactInfo?: string;
      licenseNumber?: string;
    },
  ) {
    const facility = await this.facilityRepo.findOne({ where: { id } });

    if (!facility) {
      throw new NotFoundException(`Processing Facility with ID ${id} not found`);
    }

    if (data.name) facility.name = data.name;
    if (data.address) facility.address = data.address;
    if (data.contactInfo !== undefined) facility.contactInfo = data.contactInfo;
    if (data.licenseNumber) facility.licenseNumber = data.licenseNumber;

    await this.facilityRepo.save(facility);

    return { success: true, id: facility.id };
  }

  async deleteFacility(id: number) {
    const result = await this.facilityRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Processing Facility with ID ${id} not found`);
    }

    return { success: true };
  }

  // Processing Operations methods
  async getAllOperations() {
    const operations = await this.processingRepo.find({
      relations: ['facility', 'batch', 'batch.agricultureProduct'],
      order: { id: 'DESC' },
    });

    return operations.map((op) => ({
      id: op.id,
      packagingDate: op.packagingDate,
      weightPerUnit: op.weightPerUnit,
      processedBy: op.processedBy,
      packagingType: op.packagingType,
      processingDate: op.processingDate,
      facilityId: op.facilityId,
      facilityName: op.facility?.name,
      batchId: op.batchId,
      productName: op.batch?.agricultureProduct?.name,
    }));
  }

  async getOperation(id: number) {
    const operation = await this.processingRepo.findOne({
      where: { id },
      relations: ['facility', 'batch', 'batch.agricultureProduct'],
    });

    if (!operation) {
      throw new NotFoundException(`Processing Operation with ID ${id} not found`);
    }

    return {
      id: operation.id,
      packagingDate: operation.packagingDate,
      weightPerUnit: operation.weightPerUnit,
      processedBy: operation.processedBy,
      packagingType: operation.packagingType,
      processingDate: operation.processingDate,
      facilityId: operation.facilityId,
      facilityName: operation.facility?.name,
      batchId: operation.batchId,
      productName: operation.batch?.agricultureProduct?.name,
    };
  }

  async createOperation(data: {
    id: number;
    packagingDate: string;
    weightPerUnit: number;
    processedBy?: string;
    packagingType?: string;
    processingDate?: string;
    facilityId: number;
    batchId: number;
  }) {
    const operation = this.processingRepo.create({
      id: data.id,
      packagingDate: new Date(data.packagingDate),
      weightPerUnit: data.weightPerUnit,
      processedBy: data.processedBy,
      packagingType: data.packagingType,
      processingDate: data.processingDate ? new Date(data.processingDate) : null,
      facilityId: data.facilityId,
      batchId: data.batchId,
    });

    await this.processingRepo.save(operation);

    return { success: true, id: operation.id };
  }

  async updateOperation(
    id: number,
    data: {
      packagingDate?: string;
      weightPerUnit?: number;
      processedBy?: string;
      packagingType?: string;
      processingDate?: string;
      facilityId?: number;
      batchId?: number;
    },
  ) {
    const operation = await this.processingRepo.findOne({ where: { id } });

    if (!operation) {
      throw new NotFoundException(`Processing Operation with ID ${id} not found`);
    }

    if (data.packagingDate) operation.packagingDate = new Date(data.packagingDate);
    if (data.weightPerUnit) operation.weightPerUnit = data.weightPerUnit;
    if (data.processedBy !== undefined) operation.processedBy = data.processedBy;
    if (data.packagingType !== undefined) operation.packagingType = data.packagingType;
    if (data.processingDate !== undefined) {
      operation.processingDate = data.processingDate ? new Date(data.processingDate) : null;
    }
    if (data.facilityId) operation.facilityId = data.facilityId;
    if (data.batchId) operation.batchId = data.batchId;

    await this.processingRepo.save(operation);

    return { success: true, id: operation.id };
  }

  async deleteOperation(id: number) {
    const result = await this.processingRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Processing Operation with ID ${id} not found`);
    }

    return { success: true };
  }
}
