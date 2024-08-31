import { EditorChangeType, ImageApiStatus } from "./constants"

// grid entities
export type GridIndex = {
  index: number,
  imageId: number|undefined,
  apiStatus: ImageApiStatus,
}

// size
export type Size = {
  width: number,
  height: number,
}

// Pagination params
export type Pagination = {
  page: number,
  limit: number,
}

// Image base props
export interface ImageBase {
  author: string
  url: string
}

// Image DTO
export interface ImageDTO extends ImageBase, Size {
  id: string
  download_url: string
}

// Image for inner use
export interface Image extends ImageBase {
  id: number
  downloadUrl: string
  size: Size
}

// editor action props
export interface EditorAction {
  type: EditorChangeType,
  props: ResizeProps|GreyscaleProps|BlurProps,
  url: string,
  active: boolean,
}

export interface ImageEditorStoreItem {
  image: Image,
  editorActions: EditorAction[],
  url: string,
  size: Size,
}

export interface ResizeProps {
  isPercentage: boolean,
  isAspect: boolean,
  w: string,
  h: string,
  wAbs: number,
  hAbs: number,
}

export interface GreyscaleProps {
  isGreyscale: boolean,
}

export interface BlurProps {
  blur: number,
}