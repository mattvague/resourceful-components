// Type definitions for Resourceful 1.0.0
// Definitions by: Matt

export function resourceful(resource: Resource): string;
export function resourcefulList(resource: Resource): number;

export interface Resource {
  name: string;
  length: number;
  extras?: string[];
}
