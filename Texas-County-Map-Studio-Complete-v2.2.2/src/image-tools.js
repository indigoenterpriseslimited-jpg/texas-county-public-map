export const resizeImageFile = (file, maximumSize = 180) => new Promise((resolve, reject) => {
  if (!file?.type?.startsWith('image/')) { reject(new Error('Please choose an image file.')); return; }
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('The image could not be read.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('The image could not be opened.'));
    image.onload = () => {
      const scale = Math.min(1, maximumSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/webp', .8));
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});
