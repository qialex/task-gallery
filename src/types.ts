import { EditorChangeType, ImageApiStatus } from "./constants"

// Pagination params
export type Pagination = {
  page: number,
  limit: number,
}

// Image base props
export interface ImageItemBase {
  width: number
  height: number
  author: string
  url: string
}

// Image DTO
export interface ImageItemDTO extends ImageItemBase {
  id: string
  download_url: string
}

// Image for inner use
export interface ImageItem extends ImageItemBase {
  id: number
  downloadUrl: string
}

export interface ImageStoreItem {
  index: number,
  image: ImageItem|undefined,
  status: ImageApiStatus,
}

export interface EditorAction {
  type: EditorChangeType,
  props: ResizeProps|GreyscaleProps|BlurProps,
  url: string,
  active: boolean,
}

export interface ImageEditorStoreItem extends Omit<ImageStoreItem, 'index'> {
  editorActions: EditorAction[],
  url: string,
  size: {
    width: number,
    height: number,
  },
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