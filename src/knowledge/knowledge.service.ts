import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Article } from './entities/article.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  // Article operations
  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create(createArticleDto);

    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createArticleDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createArticleDto.categoryId} not found`,
      );
    }

    // Verify tags exist if provided
    if (createArticleDto.tagIds) {
      const tags = await this.tagRepository.findByIds(createArticleDto.tagIds);
      if (tags.length !== createArticleDto.tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }
      article.tags = tags;
    }

    const savedArticle = await this.articleRepository.save(article);

    // Update category article count
    category.articleCount++;
    await this.categoryRepository.save(category);

    // Update tags article count
    if (article.tags) {
      for (const tag of article.tags) {
        tag.articleCount++;
        await this.tagRepository.save(tag);
      }
    }

    return savedArticle;
  }

  async findAllArticles(): Promise<Article[]> {
    return await this.articleRepository.find({
      relations: ['author', 'category', 'tags'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneArticle(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async updateArticle(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOneArticle(id);

    // Handle category change
    if (
      updateArticleDto.categoryId &&
      updateArticleDto.categoryId !== article.categoryId
    ) {
      const newCategory = await this.categoryRepository.findOne({
        where: { id: updateArticleDto.categoryId },
      });
      if (!newCategory) {
        throw new NotFoundException(
          `Category with ID ${updateArticleDto.categoryId} not found`,
        );
      }

      // Update category counts
      const oldCategory = await this.categoryRepository.findOne({
        where: { id: article.categoryId },
      });
      if (oldCategory) {
        oldCategory.articleCount--;
        await this.categoryRepository.save(oldCategory);
      }
      newCategory.articleCount++;
      await this.categoryRepository.save(newCategory);
    }

    // Handle tags change
    if (updateArticleDto.tagIds) {
      const newTags = await this.tagRepository.findByIds(
        updateArticleDto.tagIds,
      );
      if (newTags.length !== updateArticleDto.tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }

      // Update tag counts
      for (const oldTag of article.tags) {
        if (!updateArticleDto.tagIds.includes(oldTag.id)) {
          oldTag.articleCount--;
          await this.tagRepository.save(oldTag);
        }
      }
      for (const newTag of newTags) {
        if (!article.tags.map((t) => t.id).includes(newTag.id)) {
          newTag.articleCount++;
          await this.tagRepository.save(newTag);
        }
      }
      article.tags = newTags;
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async removeArticle(id: string): Promise<void> {
    const article = await this.findOneArticle(id);

    // Update category count
    const category = await this.categoryRepository.findOne({
      where: { id: article.categoryId },
    });
    if (category) {
      category.articleCount--;
      await this.categoryRepository.save(category);
    }

    // Update tag counts
    for (const tag of article.tags) {
      tag.articleCount--;
      await this.tagRepository.save(tag);
    }

    const result = await this.articleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  // Category operations
  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ['articles'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findOneCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['articles'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOneCategory(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);
    if (category.articleCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing articles',
      );
    }

    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  // Tag operations
  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAllTags(): Promise<Tag[]> {
    return await this.tagRepository.find({
      relations: ['articles'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findOneTag(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['articles'],
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOneTag(id);
    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async removeTag(id: string): Promise<void> {
    const tag = await this.findOneTag(id);
    if (tag.articleCount > 0) {
      throw new BadRequestException('Cannot delete tag with existing articles');
    }

    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  // Search operations
  async searchArticles(query: string): Promise<Article[]> {
    return await this.articleRepository.find({
      where: [
        { title: Like(`%${query}%`) },
        { content: Like(`%${query}%`) },
        { summary: Like(`%${query}%`) },
      ],
      relations: ['author', 'category', 'tags'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getArticlesByCategory(categoryId: string): Promise<Article[]> {
    await this.findOneCategory(categoryId); // Verify category exists
    return await this.articleRepository.find({
      where: { categoryId },
      relations: ['author', 'category', 'tags'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getArticlesByTag(tagId: string): Promise<Article[]> {
    const tag = await this.findOneTag(tagId);
    return tag.articles;
  }
}
