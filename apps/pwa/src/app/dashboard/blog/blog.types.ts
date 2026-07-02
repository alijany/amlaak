export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  GONE = 'gone',
  REDIRECT = 'redirect',
  SCHEDULED = 'scheduled',
  NOINDEX = 'noindex',
}

export enum BlogPostType {
  BAKHSHNAMEH = 'bakhshnameh',
  AKHBAR = 'akhbar',
  MAGHALE = 'maghale',
}

export const BlogPostTypeLabels: Record<BlogPostType, string> = {
  [BlogPostType.BAKHSHNAMEH]: 'بخشنامه',
  [BlogPostType.AKHBAR]: 'اخبار',
  [BlogPostType.MAGHALE]: 'مقاله',
};

export interface BlogAuthor {
  id: number;
  name: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  status: BlogPostStatus;
  type?: BlogPostType;
  redirectUrl?: string;
  publishAt?: string;
  author: BlogAuthor;
  categories: BlogCategory[];
  publishedAt?: string;
  created_at: string;
  updated_at: string;
}

export type GetBlogPostsResponse = {
  items: BlogPost[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
};

export interface CreatePostDto {
  title: string;
  body: string;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  status?: BlogPostStatus;
  type?: BlogPostType;
  categoryIds?: number[];
  redirectUrl?: string;
  publishAt?: string;
}

export type UpdatePostDto = Partial<CreatePostDto>;

export interface BlogFilterDto {
  page?: number;
  limit?: number;
  status?: BlogPostStatus;
  type?: BlogPostType;
  categoryId?: number;
}
