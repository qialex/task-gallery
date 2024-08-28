import { Pagination, ResizeProps } from "./types"

export const LOCAL_STORAGE_ITEMS_PER_PAGE_KEY = "LOCAL_STORAGE_ITEMS_PER_PAGE_KEY"

export const defaultPagination: Pagination = {
  page: 1,
  limit: 25,
}

export enum RequestPhase {
  idle = "idle",
  loading = "loading",
  failed = "failed",
}

// options for items per page
export const PAGINATION_LIMIT_ITEMS: number[] = [10,25,50,100]
export const PAGINATION_LIMIT_MIN: number = 1
export const PAGINATION_LIMIT_MAX: number = 100
export const PAGINATION_PAGE_MIN: number = 1


export enum PaginationChangeType {
  firstPage = "firstPage",
  nextPage = "nextPage",
  previousPage = "previousPage",
}

export enum ImageApiStatus {
  doensExist = "doensExist",
  error = "error",
  loaded = "loaded",
}


export const resizePropsInitial: ResizeProps = {
  isPercentage: false,
  isAspect: false,
  w: '',
  h: '',
  wAbs: 0,
  hAbs: 0,
}

export const EDITOR_SIZE_MAX_PERCENT = 500
export const EDITOR_SIZE_MIN_PERCENT = 1

export const EDITOR_SIZE_MAX_PX = 10000
export const EDITOR_SIZE_MIN_PX = 1


export enum EditorChangeType {
  resize = 'resize',
  greyscale = 'greyscale',
  blur = 'blur',
}

