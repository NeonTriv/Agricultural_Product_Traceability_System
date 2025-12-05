import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Type } from './entities/type.entity';
import { AgricultureProduct } from './entities/agriculture-product.entity';
import { FarmCertification } from './entities/farm-certification.entity';

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Type)
    private readonly typeRepo: Repository<Type>,
    @InjectRepository(AgricultureProduct)
    private readonly agricultureProductRepo: Repository<AgricultureProduct>,
    @InjectRepository(FarmCertification)
    private readonly farmCertificationRepo: Repository<FarmCertification>,
  ) {}

  // ==================== CATEGORIES ====================
  async getAllCategories() {
    const categories = await this.categoryRepo.find({
      order: { id: 'ASC' },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  async getCategory(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(data: { name: string }) {
    const category = this.categoryRepo.create({
      name: data.name,
    });
    const saved = await this.categoryRepo.save(category);
    return { success: true, id: saved.id };
  }

  async updateCategory(id: number, data: { name?: string }) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    if (data.name) category.name = data.name;
    await this.categoryRepo.save(category);
    return { success: true, id: category.id };
  }

  async deleteCategory(id: number) {
    const result = await this.categoryRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return { success: true };
  }

  // ==================== TYPES ====================
  async getAllTypes() {
    const types = await this.typeRepo.find({
      relations: ['category'],
      order: { id: 'ASC' },
    });
    return types.map((t) => ({
      id: t.id,
      variety: t.variety,
      categoryId: t.categoryId,
      categoryName: t.category?.name || 'Unknown',
    }));
  }

  async getType(id: number) {
    const type = await this.typeRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!type) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }
    return type;
  }

  async createType(data: {
    variety: string;
    categoryId: number;
  }) {
    const type = this.typeRepo.create({
      variety: data.variety,
      categoryId: data.categoryId,
    });
    const saved = await this.typeRepo.save(type);
    return { success: true, id: saved.id };
  }

  async updateType(
    id: number,
    data: { variety?: string; categoryId?: number },
  ) {
    const type = await this.typeRepo.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }
    if (data.variety !== undefined) type.variety = data.variety;
    if (data.categoryId) type.categoryId = data.categoryId;
    await this.typeRepo.save(type);
    return { success: true, id: type.id };
  }

  async deleteType(id: number) {
    const result = await this.typeRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }
    return { success: true };
  }

  // ==================== AGRICULTURE PRODUCTS ====================
  async getAllAgricultureProducts() {
    const products = await this.agricultureProductRepo.find({
      relations: ['type', 'type.category'],
      order: { id: 'ASC' },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      typeId: p.typeId,
      typeVariety: p.type?.variety || 'Unknown',
      categoryName: p.type?.category?.name || 'Unknown',
    }));
  }

  async getAgricultureProduct(id: number) {
    const product = await this.agricultureProductRepo.findOne({
      where: { id },
      relations: ['type'],
    });
    if (!product) {
      throw new NotFoundException(
        `Agriculture Product with ID ${id} not found`,
      );
    }
    return product;
  }

  async createAgricultureProduct(data: {
    name: string;
    imageUrl?: string;
    typeId: number;
  }) {
    const product = this.agricultureProductRepo.create({
      name: data.name,
      imageUrl: data.imageUrl,
      typeId: data.typeId,
    });
    const saved = await this.agricultureProductRepo.save(product);
    return { success: true, id: saved.id };
  }

  async updateAgricultureProduct(
    id: number,
    data: { name?: string; imageUrl?: string; typeId?: number },
  ) {
    const product = await this.agricultureProductRepo.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(
        `Agriculture Product with ID ${id} not found`,
      );
    }
    if (data.name) product.name = data.name;
    if (data.imageUrl !== undefined) product.imageUrl = data.imageUrl;
    if (data.typeId) product.typeId = data.typeId;
    await this.agricultureProductRepo.save(product);
    return { success: true, id: product.id };
  }

  async deleteAgricultureProduct(id: number) {
    const result = await this.agricultureProductRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Agriculture Product with ID ${id} not found`,
      );
    }
    return { success: true };
  }

  // ==================== FARM CERTIFICATIONS ====================
  async getAllFarmCertifications() {
    const certifications = await this.farmCertificationRepo.find({
      relations: ['farm'],
      order: { farmId: 'ASC', farmCertifications: 'ASC' },
    });
    return certifications.map((c) => ({
      farmId: c.farmId,
      farmCertifications: c.farmCertifications,
      farmName: c.farm?.name || 'Unknown',
    }));
  }

  async getFarmCertification(farmId: number, certificationName: string) {
    const certification = await this.farmCertificationRepo.findOne({
      where: { farmId, farmCertifications: certificationName },
      relations: ['farm'],
    });
    if (!certification) {
      throw new NotFoundException(
        `Farm Certification not found for farmId ${farmId} and certification ${certificationName}`,
      );
    }
    return certification;
  }

  async createFarmCertification(data: {
    farmId: number;
    farmCertifications: string;
  }) {
    const certification = this.farmCertificationRepo.create({
      farmId: data.farmId,
      farmCertifications: data.farmCertifications,
    });
    const saved = await this.farmCertificationRepo.save(certification);
    return { success: true, farmId: saved.farmId, farmCertifications: saved.farmCertifications };
  }

  async updateFarmCertification(
    farmId: number,
    certificationName: string,
    data: {
      newFarmId?: number;
      newFarmCertifications?: string;
    },
  ) {
    const certification = await this.farmCertificationRepo.findOne({
      where: { farmId, farmCertifications: certificationName },
    });
    if (!certification) {
      throw new NotFoundException(
        `Farm Certification not found for farmId ${farmId} and certification ${certificationName}`,
      );
    }
    // Since this has composite PK, we need to delete old and create new if PK changes
    if (data.newFarmId || data.newFarmCertifications) {
      await this.farmCertificationRepo.delete({ farmId, farmCertifications: certificationName });
      const newCert = this.farmCertificationRepo.create({
        farmId: data.newFarmId || farmId,
        farmCertifications: data.newFarmCertifications || certificationName,
      });
      const saved = await this.farmCertificationRepo.save(newCert);
      return { success: true, farmId: saved.farmId, farmCertifications: saved.farmCertifications };
    }
    return { success: true, farmId, farmCertifications: certificationName };
  }

  async deleteFarmCertification(farmId: number, certificationName: string) {
    const result = await this.farmCertificationRepo.delete({
      farmId,
      farmCertifications: certificationName
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Farm Certification not found for farmId ${farmId} and certification ${certificationName}`,
      );
    }
    return { success: true };
  }
}
