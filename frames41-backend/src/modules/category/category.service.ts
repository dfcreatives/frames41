import type { Category } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import type { ICategoryRepository, ICategoryService, CategoryWithChildren } from './category.types.js';

/**
 * Category service implementation
 */
export class CategoryService implements ICategoryService {
  private readonly repository: ICategoryRepository;

  constructor(repository: ICategoryRepository) {
    this.repository = repository;
  }

  async getCategoryTree(includeInactive = false, onlyWithProducts = false): Promise<CategoryWithChildren[]> {
    const repo = this.repository as CategoryRepository;
    return repo.buildCategoryTree(includeInactive, onlyWithProducts);
  }

  async getCategoryById(id: string): Promise<CategoryWithChildren> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new NotFoundError('Category');
    }

    return category as CategoryWithChildren;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryWithChildren> {
    const category = await this.repository.findBySlug(slug);

    if (!category) {
      throw new NotFoundError('Category');
    }

    return category as CategoryWithChildren;
  }

  async createCategory(data: {
    slug: string;
    name: string;
    description?: string;
    parentId?: string | null;
    mdfShape?: string;
    sortOrder?: number;
    image?: string | null;
    isActive?: boolean;
  }): Promise<Category> {
    // Check slug uniqueness
    const slugExists = await this.repository.slugExists(data.slug);
    if (slugExists) {
      throw new ConflictError(`Category with slug "${data.slug}" already exists`);
    }

    // Validate parent if provided
    if (data.parentId) {
      const parent = await this.repository.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category');
      }
    }

    const category = await this.repository.create({
      slug: data.slug,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      mdfShape: data.mdfShape,
      sortOrder: data.sortOrder ?? 0,
      image: data.image,
      isActive: data.isActive ?? true,
    });

    logger.info({ categoryId: category.id }, 'Category created');
    return category;
  }

  async updateCategory(
    id: string,
    data: Partial<{
      slug: string;
      name: string;
      description: string;
      parentId: string | null;
      mdfShape: string;
      sortOrder: number;
      image: string | null;
      isActive: boolean;
    }>,
  ): Promise<Category> {
    // Check if category exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Category');
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.repository.slugExists(data.slug, id);
      if (slugExists) {
        throw new ConflictError(`Category with slug "${data.slug}" already exists`);
      }
    }

    // Validate parent if changing
    if (data.parentId && data.parentId !== existing.parentId) {
      // Prevent circular reference
      if (data.parentId === id) {
        throw new ConflictError('Category cannot be its own parent');
      }

      const parent = await this.repository.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category');
      }
    }

    const category = await this.repository.update(id, data);
    logger.info({ categoryId: id }, 'Category updated');
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    // Check if category exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Category');
    }

    // Check if category has children
    const children = await this.repository.findChildren(id, true);
    if (children.length > 0) {
      throw new ConflictError('Cannot delete category with subcategories');
    }

    await this.repository.delete(id);
    logger.info({ categoryId: id }, 'Category deleted');
  }
}

// Import for type assertion
import { CategoryRepository } from './category.repository.js';
