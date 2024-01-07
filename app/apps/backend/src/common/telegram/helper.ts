export function encode(data: Record<string, any>): string {
  return encodeURIComponent(JSON.stringify(data));
}

export function decode(data: string): Record<string, any> {
  try {
    const str = decodeURIComponent(data);
    return JSON.parse(str);
  } catch (_: unknown) {
    return {};
  }
}
