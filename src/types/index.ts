export interface ImageData {
    src: string;
    format: 'png' | 'jpeg' | 'webp' | 'svg';
    width: number;
    height: number;
}

export interface SizeOption {
    label: string;
    value: number;
}

export const sizeOptions: SizeOption[] = [
    { label: '16x16', value: 16 },
    { label: '32x32', value: 32 },
    { label: '64x64', value: 64 },
    { label: '128x128', value: 128 },
    { label: '192x192', value: 192 },
    { label: '256x256', value: 256 },
    { label: '512x512', value: 512 },
];