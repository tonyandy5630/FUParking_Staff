import React from "react";

export interface Crop {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

const cropImageToBase64 = (src: string, crop?: Crop): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!crop) {
      resolve("");
      return;
    }
    const image = new Image();
    image.src = src;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const width = crop.xmax - crop.xmin;
        const height = crop.ymax - crop.ymin;
        ctx.imageSmoothingQuality = "high";

        // Set canvas dimensions to the size of the cropped area
        canvas.width = width;
        canvas.height = height;

        // Draw the cropped part of the image
        ctx.drawImage(
          image,
          crop.xmin, // source x
          crop.ymin, // source y
          width, // source width
          height, // source height
          0, // destination x
          0, // destination y
          width, // destination width
          height // destination height
        );

        // Convert canvas to base64 string
        const base64String = canvas.toDataURL("image/png");
        resolve(base64String);
      } else {
        reject("Canvas context is not available");
      }
    };

    image.onerror = () => reject("Image failed to load");
  });
};

export default cropImageToBase64;
