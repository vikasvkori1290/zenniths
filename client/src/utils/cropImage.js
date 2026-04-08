const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

/**
 * Parses a data URL or Blob URL and yields a File of the cropped region
 * @param {string} imageSrc
 * @param {Object} pixelCrop
 * @returns {Promise<File>}
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set the canvas size to the final desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw the image onto the canvas, translating by the crop coords
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(new File([file], "cropped-poster.jpg", { type: "image/jpeg" }));
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, 'image/jpeg', 0.9);
  });
}
