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

export const addDateToImage = async (
  base64Image: string,
  text: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // To avoid CORS issues with image loading
    image.src = base64Image;

    image.onload = () => {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject("Unable to get canvas context");
        return;
      }

      // Set canvas dimensions to match the image dimensions
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the base64 image on the canvas
      ctx.drawImage(image, 0, 0);

      // Set default font and text properties
      const fontSize = 14;
      const textColor = "yellow";
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = textColor;

      // Calculate the position for the text in the lower-right corner
      const textWidth = ctx.measureText(text).width;
      const padding = 10;
      const x = canvas.width - textWidth - padding;
      const y = canvas.height - padding;

      // Add the text to the lower-right corner
      ctx.fillText(text, x, y);

      // Convert canvas to base64
      const resultBase64Image = canvas.toDataURL("image/png");

      resolve(resultBase64Image);
    };

    image.onerror = () => {
      reject("Failed to load the image");
    };
  });
};
