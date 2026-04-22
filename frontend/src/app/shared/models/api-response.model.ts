export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  statusCode: number;
}

export interface PagedResult<T> {
  results: T[];
  rowCount: number;
  currentPage: number;
  pageSize: number;
  pageCount: number;
  firstRowOnPage: number;
  lastRowOnPage: number;
}
