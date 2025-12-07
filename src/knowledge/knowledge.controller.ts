import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@ApiTags('Knowledge Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // Article endpoints
  @Post('articles')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  createArticle(@Body() createArticleDto: CreateArticleDto) {
    return this.knowledgeService.createArticle(createArticleDto);
  }

  @Get('articles')
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({ status: 200, description: 'Returns all articles' })
  findAllArticles() {
    return this.knowledgeService.findAllArticles();
  }

  @Get('articles/search')
  @ApiOperation({ summary: 'Search articles' })
  @ApiResponse({ status: 200, description: 'Returns matching articles' })
  searchArticles(@Query('query') query: string) {
    return this.knowledgeService.searchArticles(query);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({ status: 200, description: 'Returns the article' })
  findOneArticle(@Param('id') id: string) {
    return this.knowledgeService.findOneArticle(id);
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  updateArticle(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.knowledgeService.updateArticle(id, updateArticleDto);
  }

  @Delete('articles/:id')
  @ApiOperation({ summary: 'Delete article' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  removeArticle(@Param('id') id: string) {
    return this.knowledgeService.removeArticle(id);
  }

  // Category endpoints
  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.knowledgeService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  findAllCategories() {
    return this.knowledgeService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Returns the category' })
  findOneCategory(@Param('id') id: string) {
    return this.knowledgeService.findOneCategory(id);
  }

  @Get('categories/:id/articles')
  @ApiOperation({ summary: 'Get articles by category' })
  @ApiResponse({ status: 200, description: 'Returns articles in the category' })
  getArticlesByCategory(@Param('id') id: string) {
    return this.knowledgeService.getArticlesByCategory(id);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.knowledgeService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  removeCategory(@Param('id') id: string) {
    return this.knowledgeService.removeCategory(id);
  }

  // Tag endpoints
  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  createTag(@Body() createTagDto: CreateTagDto) {
    return this.knowledgeService.createTag(createTagDto);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Returns all tags' })
  findAllTags() {
    return this.knowledgeService.findAllTags();
  }

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Returns the tag' })
  findOneTag(@Param('id') id: string) {
    return this.knowledgeService.findOneTag(id);
  }

  @Get('tags/:id/articles')
  @ApiOperation({ summary: 'Get articles by tag' })
  @ApiResponse({ status: 200, description: 'Returns articles with the tag' })
  getArticlesByTag(@Param('id') id: string) {
    return this.knowledgeService.getArticlesByTag(id);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.knowledgeService.updateTag(id, updateTagDto);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  removeTag(@Param('id') id: string) {
    return this.knowledgeService.removeTag(id);
  }
}
