export interface PaginationInput {
  page: number;
  limit: number;
}

export const paginationArgs = ({ page, limit }: PaginationInput) => ({
  skip: (page - 1) * limit,
  take: limit
});

export const paginationMeta = (
  total: number,
  { page, limit }: PaginationInput
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1
});
