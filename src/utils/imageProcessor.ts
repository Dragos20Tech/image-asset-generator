export const resizeImage = (image: HTMLImageElement, width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
};

export const processImage = (image: File, size: { width: number; height: number }): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (event) => {
            if (event.target?.result) {
                img.src = event.target.result as string;
                img.onload = () => {
                    const resizedCanvas = resizeImage(img, size.width, size.height);
                    resizedCanvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob from canvas'));
                        }
                    }, 'image/png');
                };
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read image file'));
        };

        reader.readAsDataURL(image);
    });
};