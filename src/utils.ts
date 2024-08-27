import { Pagination } from "./types";

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
      // access file here
      var link = document.createElement("a");
      // If you don't know the name or want to use
      // the webserver default set name = ''
      link.setAttribute('download', fileName);
      link.href = urlObj;
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
}

// export class ImageTools {
//   base64ResizedImage: string|null = null;
  
//   // constructor() {}
  
//   ResizeImage(base64image: string, width: number = 1080, height: number = 1080) {
//     let img = new Image();
//     img.src = base64image;
  
//     img.onload = () => {
//       // Check if the image require resize at all
//       if(img.height <= height && img.width <= width) {
//         this.base64ResizedImage = base64image;
//         // TODO: Call method to do something with the resize image
//       }
//       else {
//         // Make sure the width and height preserve the original aspect ratio and adjust if needed
//         if(img.height > img.width) {
//           width = Math.floor(height * (img.width / img.height));
//         }
//         else {
//           height = Math.floor(width * (img.height / img.width));
//         }

//         let resizingCanvas: HTMLCanvasElement = document.createElement('canvas');
//         let resizingCanvasContext = resizingCanvas.getContext("2d");

//         // Start with original image size
//         resizingCanvas.width = img.width;
//         resizingCanvas.height = img.height;


//         // Draw the original image on the (temp) resizing canvas
//         resizingCanvasContext.drawImage(img, 0, 0, resizingCanvas.width, resizingCanvas.height);

//         let curImageDimensions = {
//           width: Math.floor(img.width),
//           height: Math.floor(img.height)
//         };

//         let halfImageDimensions = {
//           width: null,
//           height: null
//         };

//         // Quickly reduce the dize by 50% each time in few iterations until the size is less then
//         // 2x time the target size - the motivation for it, is to reduce the aliasing that would have been
//         // created with direct reduction of very big image to small image
//         while (curImageDimensions.width * 0.5 > width) {
//           // Reduce the resizing canvas by half and refresh the image
//           halfImageDimensions.width = Math.floor(curImageDimensions.width * 0.5);
//           halfImageDimensions.height = Math.floor(curImageDimensions.height * 0.5);

//           resizingCanvasContext.drawImage(
//             resizingCanvas, 
//             0, 
//             0, 
//             curImageDimensions.width, 
//             curImageDimensions.height,
//             0,
//             0,
//             halfImageDimensions.width,
//             halfImageDimensions.height
//           );

//           curImageDimensions.width = halfImageDimensions.width;
//           curImageDimensions.height = halfImageDimensions.height;
//         }

//         // Now do final resize for the resizingCanvas to meet the dimension requirments
//         // directly to the output canvas, that will output the final image
//         let outputCanvas: HTMLCanvasElement = document.createElement('canvas');
//         let outputCanvasContext = outputCanvas.getContext("2d");

//         outputCanvas.width = width;
//         outputCanvas.height = height;

//         outputCanvasContext.drawImage(
//           resizingCanvas, 
//           0, 
//           0, 
//           curImageDimensions.width, 
//           curImageDimensions.height,
//           0, 
//           0, 
//           width, 
//           height
//         );

//         // output the canvas pixels as an image. params: format, quality
//         this.base64ResizedImage = outputCanvas.toDataURL('image/jpeg', 0.85);

//         // TODO: Call method to do something with the resize image
//       }
//     };
//   }
// }