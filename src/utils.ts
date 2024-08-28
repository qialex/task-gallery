import { Pagination, ResizeProps } from "./types";

export const parseNumValue = (pageParam: string|null): number|false => {
  if (pageParam) {
    const n = parseInt(pageParam, 10);
    if (!isNaN(n) && n >= 1) {
      return n
    }
  }
  return false;
}

export const calculatePageChange = (page: number, limitOld: number, limitNew: number): number => {
  const firstIndex = ( page - 1 ) * limitOld
  const firstPage = ~~(firstIndex / limitNew) + 1
  return Math.max(firstPage, 1)
}

export const getStartEndIndex = (pagination: Pagination): {start: number, end: number} => {
  const start = (pagination.page - 1) * pagination.limit
  return {start, end: start + pagination.limit}
}


export const downloadURI = async (uri: string, name: string): Promise<void> => {
  const fileName = name + '.jpg'
  fetch(uri)
    .then(async response => {
      // const contentType: any = response.headers.get('content-type')
      const blob = await response.blob()
      const file = new File([blob], fileName)
      const urlObj = URL.createObjectURL(file)
      var link = document.createElement("a");
      link.setAttribute('download', fileName);
      link.href = urlObj;
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
}

// async image api url with blur and greyscale params
export const getURL = (url: string, blur: number, grayscale: boolean): string => {
  let result = new URL(url);
  if (grayscale) {
    result.searchParams.append('grayscale', '')
  }
  if (blur) {
    result.searchParams.append('blur', blur.toString())
  }
  return result.href;
}

// async resize image
export const resizeImage = async (imageUrl: string, resize: ResizeProps): Promise<string> => {
  return new Promise((resolve, reject) => {
    const applyResize = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext("2d");
  
        canvas.width  = resize.isPercentage ? Math.round(img.width  * parseInt(resize.w) / 100) : parseInt(resize.w);
        canvas.height = resize.isPercentage ? Math.round(img.height * parseInt(resize.h) / 100) : parseInt(resize.h);
    
        if (!ctx) {
          reject(new Error('noCtx'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 1.0));
      } catch (e) {
        console.error(e)
        reject(e)
      }
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = applyResize;
    img.src = imageUrl;
  })
}