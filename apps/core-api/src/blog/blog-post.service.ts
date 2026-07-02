import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { UserEntity } from 'src/user/user.entity';
import { BlogCategoryEntity } from './blog-category.entity';
import { BlogPostEntity, BlogPostStatus } from './blog-post.entity';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostsFilterDto } from './dtos/posts-filter.dto';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class BlogPostService extends BaseRepositoryService<BlogPostEntity> {
  constructor(
    @InjectRepository(BlogPostEntity)
    protected repository: EntityRepository<BlogPostEntity>,
    @InjectRepository(BlogCategoryEntity)
    private readonly categoryRepository: EntityRepository<BlogCategoryEntity>,
  ) {
    super(repository);
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w؀-ۿ-]/g, '')
      .replace(/--+/g, '-');
  }

  private async uniqueSlug(base: string, excludeId?: number): Promise<string> {
    let slug = this.slugify(base);
    let counter = 0;
    while (true) {
      const candidate = counter === 0 ? slug : `${slug}-${counter}`;
      const where: any = { slug: candidate };
      if (excludeId) where.id = { $ne: excludeId };
      const existing = await this.findOne(where);
      if (!existing) return candidate;
      counter++;
    }
  }

  async createPost(
    author: UserEntity,
    dto: CreatePostDto,
  ): Promise<BlogPostEntity> {
    const slug = await this.uniqueSlug(dto.title);

    const post = this.repository.create({
      title: dto.title,
      slug,
      body: dto.body,
      excerpt: dto.excerpt,
      coverImage: dto.coverImage,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      ogImage: dto.ogImage,
      status: dto.status ?? BlogPostStatus.DRAFT,
      redirectUrl: dto.redirectUrl,
      publishAt: dto.publishAt ? new Date(dto.publishAt) : undefined,
      author,
      publishedAt:
        dto.status === BlogPostStatus.PUBLISHED ? new Date() : undefined,
    });

    if (dto.categoryIds?.length) {
      const cats = await this.categoryRepository.find({
        id: { $in: dto.categoryIds },
      });
      post.categories.set(cats);
    }

    await this.persistAndFlush(post);
    return post;
  }

  async updatePost(id: number, dto: UpdatePostDto): Promise<BlogPostEntity> {
    const post = await this.findOne(
      { id },
      { populate: ['categories'] as never },
    );
    if (!post) throw new NotFoundException('مطلب یافت نشد');

    if (dto.title && dto.title !== post.title) {
      post.slug = await this.uniqueSlug(dto.title, id);
      post.title = dto.title;
    }
    if (dto.body !== undefined) post.body = dto.body;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.coverImage !== undefined) post.coverImage = dto.coverImage;
    if (dto.metaTitle !== undefined) post.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      post.metaDescription = dto.metaDescription;
    if (dto.ogImage !== undefined) post.ogImage = dto.ogImage;
    if (dto.redirectUrl !== undefined) post.redirectUrl = dto.redirectUrl;
    if (dto.publishAt !== undefined)
      post.publishAt = dto.publishAt ? new Date(dto.publishAt) : undefined;

    if (dto.status !== undefined && dto.status !== post.status) {
      post.status = dto.status;
      if (dto.status === BlogPostStatus.PUBLISHED && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    if (dto.categoryIds !== undefined) {
      const cats = dto.categoryIds.length
        ? await this.categoryRepository.find({ id: { $in: dto.categoryIds } })
        : [];
      post.categories.set(cats);
    }

    await this.persistAndFlush(post);
    return post;
  }

  async deletePost(id: number): Promise<void> {
    const post = await this.findOne({ id });
    if (!post) throw new NotFoundException('مطلب یافت نشد');
    await this.remove(post);
  }

  async findPosts(filters: PostsFilterDto) {
    const { page = 0, limit = 10, status, categoryId } = filters;
    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categories = { id: categoryId };

    const [items, total] = await this.findAll(where, {
      orderBy: { created_at: 'DESC' },
      limit,
      offset: page * limit,
      populate: ['author', 'categories'] as never,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async findOneBySlug(slug: string): Promise<BlogPostEntity> {
    const post = await this.findOne(
      { slug },
      { populate: ['author', 'categories'] as never },
    );
    if (!post) throw new NotFoundException('مطلب یافت نشد');

    // DRAFT: never publicly visible
    if (post.status === BlogPostStatus.DRAFT) {
      throw new NotFoundException('مطلب یافت نشد');
    }

    // SCHEDULED: visible only after publishAt date
    if (post.status === BlogPostStatus.SCHEDULED) {
      if (!post.publishAt || post.publishAt > new Date()) {
        throw new NotFoundException('مطلب یافت نشد');
      }
    }

    return post;
  }

  async findOneById(id: number): Promise<BlogPostEntity> {
    const post = await this.findOne(
      { id },
      { populate: ['author', 'categories'] as never },
    );
    if (!post) throw new NotFoundException('مطلب یافت نشد');
    return post;
  }
}
