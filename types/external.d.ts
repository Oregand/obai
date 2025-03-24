declare module 'uuid' {
  export function v4(): string;
}

declare module 'qrcode' {
  export function toDataURL(data: string): Promise<string>;
}
