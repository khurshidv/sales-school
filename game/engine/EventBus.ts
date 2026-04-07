import type { GameEvent } from './types';

type EventCallback<T extends GameEvent['type']> = (
  event: Extract<GameEvent, { type: T }>,
) => void;

export class GameEventBus {
  private listeners = new Map<string, Set<Function>>();

  on<T extends GameEvent['type']>(type: T, callback: EventCallback<T>): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  off<T extends GameEvent['type']>(type: T, callback: EventCallback<T>): void {
    this.listeners.get(type)?.delete(callback);
  }

  emit(event: GameEvent): void {
    this.listeners.get(event.type)?.forEach((cb) => cb(event));
  }

  clear(): void {
    this.listeners.clear();
  }
}
