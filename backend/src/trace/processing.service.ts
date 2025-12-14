import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Processing } from './entities/processing.entity';
import { ProcessingFacility } from './entities/processing-facility.entity';
import { ProcessStep } from './entities/process-step.entity';

@Injectable()
export class ProcessingService {
  constructor(
    @InjectRepository(Processing)
    private readonly processingRepo: Repository<Processing>,
    @InjectRepository(ProcessingFacility)
    private readonly facilityRepo: Repository<ProcessingFacility>,
    @InjectRepository(ProcessStep)
    private readonly processStepRepo: Repository<ProcessStep>,
  ) {}

  // Processing Facilities methods
  async getAllFacilities() {
    const facilities = await this.facilityRepo.find({
      relations: ['processings', 'province', 'province.country'],
      order: { id: 'DESC' },
    });

    return facilities.map((f) => ({
      id: f.id,
      name: f.name,
      addressDetail: f.address,
      contactInfo: f.contactInfo,
      licenseNumber: f.licenseNumber,
      longitude: f.longitude,
      latitude: f.latitude,
      provinceId: f.provinceId,
      provinceName: f.province?.name,
      countryName: f.province?.country?.name,
      processingCount: f.processings?.length || 0,
    }));
  }

  async getFacility(id: number) {
    const facility = await this.facilityRepo.findOne({
      where: { id },
      relations: ['processings', 'province', 'province.country'],
    });

    if (!facility) {
      throw new NotFoundException(`Processing Facility with ID ${id} not found`);
    }

    return {
      id: facility.id,
      name: facility.name,
      addressDetail: facility.address,
      contactInfo: facility.contactInfo,
      licenseNumber: facility.licenseNumber,
      longitude: facility.longitude,
      latitude: facility.latitude,
      provinceId: facility.provinceId,
      provinceName: facility.province?.name,
      countryName: facility.province?.country?.name,
      processingCount: facility.processings?.length || 0,
    };
  }

  async createFacility(data: {
    name: string;
    addressDetail: string;
    contactInfo?: string;
    licenseNumber: string;
    longitude?: number;
    latitude?: number;
    provinceId?: number;
  }) {
    const facility = this.facilityRepo.create({
      name: data.name,
      address: data.addressDetail,
      contactInfo: data.contactInfo,
      licenseNumber: data.licenseNumber,
      longitude: data.longitude,
      latitude: data.latitude,
      provinceId: data.provinceId,
    });

    await this.facilityRepo.save(facility);

    return { success: true, id: facility.id };
  }

  async updateFacility(
    id: number,
    data: {
      name?: string;
      addressDetail?: string;
      contactInfo?: string;
      licenseNumber?: string;
      longitude?: number;
      latitude?: number;
      provinceId?: number;
    },
  ) {
    const facility = await this.facilityRepo.findOne({ where: { id } });

    if (!facility) {
      throw new NotFoundException(`Processing Facility with ID ${id} not found`);
    }

    if (data.name) facility.name = data.name;
    if (data.addressDetail) facility.address = data.addressDetail;
    if (data.contactInfo !== undefined) facility.contactInfo = data.contactInfo;
    if (data.licenseNumber) facility.licenseNumber = data.licenseNumber;
    if (data.longitude !== undefined) facility.longitude = data.longitude;
    if (data.latitude !== undefined) facility.latitude = data.latitude;
    if (data.provinceId !== undefined) facility.provinceId = data.provinceId;

    await this.facilityRepo.save(facility);

    return { success: true, id: facility.id };
  }

  async deleteFacility(id: number) {
    const facility = await this.facilityRepo.findOne({
      where: { id },
      relations: ['processings']
    });

    if (!facility) {
      throw new NotFoundException(`Processing Facility with ID ${id} not found`);
    }

    // Check for related processing operations
    if (facility.processings && facility.processings.length > 0) {
      throw new BadRequestException(
        `Cannot delete Processing Facility: It has ${facility.processings.length} processing operation(s). ` +
        `Please delete them first (Processing > Operations).`
      );
    }

    await this.facilityRepo.remove(facility);
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
    packagingDate: string;
    weightPerUnit: number;
    processedBy?: string;
    packagingType?: string;
    processingDate?: string;
    facilityId: number;
    batchId: number;
  }) {
    const operation = this.processingRepo.create({
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

  // Process Steps methods
  async getAllProcessSteps() {
    const steps = await this.processStepRepo.find({
      relations: ['processing', 'processing.facility', 'processing.batch'],
      order: { processingId: 'DESC' },
    });

    return steps.map((s) => ({
      processingId: s.processingId,
      step: s.step,
      facilityName: s.processing?.facility?.name,
      batchId: s.processing?.batchId,
    }));
  }

  async createProcessStep(data: { processingId: number; step: string }) {
    const processing = await this.processingRepo.findOne({ where: { id: data.processingId } });

    if (!processing) {
      throw new NotFoundException(`Processing Operation with ID ${data.processingId} not found`);
    }

    const processStep = this.processStepRepo.create({
      processingId: data.processingId,
      step: data.step,
    });

    await this.processStepRepo.save(processStep);

    return { success: true, processingId: data.processingId, step: data.step };
  }

  async deleteProcessStep(processingId: number, step: string) {
    const result = await this.processStepRepo.delete({ processingId, step });

    if (result.affected === 0) {
      throw new NotFoundException(`Process Step for Processing ${processingId} not found`);
    }

    return { success: true };
  }
}
