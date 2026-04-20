/**
 * Simple typed event emitter for router lifecycle events.
 * Replaces document.dispatchEvent(CustomEvent) from the web adapter.
 */

type Listener<T = unknown> = (data: T) => void

class EventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map()

  on<T = unknown>(event: string, callback: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const set = this.listeners.get(event)!
    set.add(callback as Listener)

    // Return unsubscribe function
    return () => set.delete(callback as Listener)
  }

  emit<T = unknown>(event: string, data?: T): boolean {
    const set = this.listeners.get(event)
    if (!set || set.size === 0) return true

    let cancelled = false
    for (const listener of set) {
      const result = listener(data) as unknown
      if (result === false) cancelled = true
    }
    return !cancelled
  }

  off(event: string): void {
    this.listeners.delete(event)
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const events = new EventEmitter()
