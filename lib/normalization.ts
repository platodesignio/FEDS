export function normalize(value: number, min = 0, max = 100): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
