import type {
  LiveRoomCommand,
  LiveRoomServerEvent,
  ReactionSentEvent,
  SessionReadyEvent,
  SnapshotEvent,
  RoomUpdatedEvent,
} from './protocol';

const REQUEST_TIMEOUT_MS = 15_000;
const HEARTBEAT_INTERVAL_MS = 20_000;
const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 10_000;

export interface LiveRoomConnectionOptions {
  url: string;
  token?: string;
  resumeToken?: string;
}

type Listener<T> = (event: T) => void;

interface PendingCommand {
  resolve: (payload: unknown) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

const generateRequestId = (): string => {
  const cryptoApi =
    typeof globalThis !== 'undefined'
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export class LiveRoomConnection {
  private socket: WebSocket | null = null;

  private heartbeatId: ReturnType<typeof setInterval> | null = null;

  private reconnectId: ReturnType<typeof setTimeout> | null = null;

  private reconnectAttempts = 0;

  private manuallyClosed = false;

  private readonly pending = new Map<string, PendingCommand>();

  private readonly readyListeners = new Set<Listener<SessionReadyEvent>>();

  private readonly snapshotListeners = new Set<Listener<SnapshotEvent>>();

  private readonly updatedListeners = new Set<Listener<RoomUpdatedEvent>>();

  private readonly reactionListeners = new Set<Listener<ReactionSentEvent>>();

  private readonly closeListeners = new Set<
    Listener<{ code: number; reason: string }>
  >();

  private readonly errorListeners = new Set<Listener<Error>>();

  private latestResumeToken: string | null = null;

  constructor(private readonly options: LiveRoomConnectionOptions) {}

  open(): void {
    if (this.socket) {
      return;
    }

    this.manuallyClosed = false;
    this.stopReconnect();
    const params = new URLSearchParams();
    const resumeToken = this.latestResumeToken ?? this.options.resumeToken;
    if (resumeToken) {
      params.set('resumeToken', resumeToken);
    } else if (this.options.token) {
      params.set('token', this.options.token);
    }

    const url = `${this.options.url}?${params.toString()}`;
    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch (error) {
      this.scheduleReconnect();
      this.errorListeners.forEach((listener) =>
        listener(error instanceof Error ? error : new Error('WebSocket error')),
      );
      return;
    }
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    socket.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    socket.addEventListener('close', (event) => {
      this.handleClose(event);
    });

    socket.addEventListener('error', () => {
      if (this.latestResumeToken) {
        return;
      }

      this.errorListeners.forEach((listener) =>
        listener(new Error('WebSocket error')),
      );
    });
  }

  close(code = 1000, reason = 'Client closed'): void {
    this.manuallyClosed = true;
    this.stopReconnect();
    if (!this.socket) {
      return;
    }
    this.stopHeartbeat();
    try {
      this.socket.close(code, reason);
    } catch {
      // ignore
    }
    this.socket = null;
  }

  get resumeToken(): string | null {
    return this.latestResumeToken;
  }

  send<TPayload = unknown>(command: LiveRoomCommand): Promise<TPayload> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('LiveRoom connection is not open'));
    }

    const requestId = generateRequestId();

    return new Promise<TPayload>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error(`Live room command timed out: ${command.type}`));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(requestId, {
        resolve: (payload) => resolve(payload as TPayload),
        reject,
        timeoutId,
      });

      try {
        this.socket?.send(JSON.stringify({ ...command, requestId }));
      } catch (error) {
        clearTimeout(timeoutId);
        this.pending.delete(requestId);
        reject(error instanceof Error ? error : new Error('Send failed'));
      }
    });
  }

  onSessionReady(listener: Listener<SessionReadyEvent>): () => void {
    this.readyListeners.add(listener);
    return () => this.readyListeners.delete(listener);
  }

  onSnapshot(listener: Listener<SnapshotEvent>): () => void {
    this.snapshotListeners.add(listener);
    return () => this.snapshotListeners.delete(listener);
  }

  onRoomUpdated(listener: Listener<RoomUpdatedEvent>): () => void {
    this.updatedListeners.add(listener);
    return () => this.updatedListeners.delete(listener);
  }

  onReactionSent(listener: Listener<ReactionSentEvent>): () => void {
    this.reactionListeners.add(listener);
    return () => this.reactionListeners.delete(listener);
  }

  onClose(listener: Listener<{ code: number; reason: string }>): () => void {
    this.closeListeners.add(listener);
    return () => this.closeListeners.delete(listener);
  }

  onError(listener: Listener<Error>): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private handleMessage(data: unknown): void {
    if (typeof data !== 'string') {
      return;
    }
    let parsed: LiveRoomServerEvent;
    try {
      parsed = JSON.parse(data) as LiveRoomServerEvent;
    } catch {
      return;
    }

    switch (parsed.type) {
      case 'session.ready': {
        this.latestResumeToken = parsed.resumeToken;
        this.readyListeners.forEach((listener) => listener(parsed));
        return;
      }
      case 'snapshot': {
        this.snapshotListeners.forEach((listener) => listener(parsed));
        return;
      }
      case 'room.updated': {
        this.updatedListeners.forEach((listener) => listener(parsed));
        return;
      }
      case 'reaction.sent': {
        this.reactionListeners.forEach((listener) => listener(parsed));
        return;
      }
      case 'command.succeeded': {
        const pending = this.pending.get(parsed.requestId);
        if (!pending) {
          return;
        }
        clearTimeout(pending.timeoutId);
        this.pending.delete(parsed.requestId);
        pending.resolve(parsed.payload);
        return;
      }
      case 'command.failed': {
        const { requestId } = parsed;
        if (!requestId) {
          return;
        }
        const pending = this.pending.get(requestId);
        if (!pending) {
          return;
        }
        clearTimeout(pending.timeoutId);
        this.pending.delete(requestId);
        pending.reject(new Error(parsed.message));
        break;
      }
      default:
        break;
    }
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();
    this.pending.forEach((pending) => {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Live room connection closed'));
    });
    this.pending.clear();
    this.socket = null;
    if (this.shouldReconnect(event)) {
      this.scheduleReconnect();
      return;
    }

    this.closeListeners.forEach((listener) =>
      listener({ code: event.code, reason: event.reason }),
    );
  }

  private startHeartbeat(): void {
    if (this.heartbeatId) {
      return;
    }

    this.heartbeatId = setInterval(() => {
      this.send({ type: 'connection.ping' }).catch(() => {
        if (this.manuallyClosed) {
          return;
        }
        this.socket?.close(4000, 'Heartbeat failed');
      });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (!this.heartbeatId) {
      return;
    }

    clearInterval(this.heartbeatId);
    this.heartbeatId = null;
  }

  private shouldReconnect(event: CloseEvent): boolean {
    if (this.manuallyClosed || !this.latestResumeToken) {
      return false;
    }

    return event.code !== 1008;
  }

  private scheduleReconnect(): void {
    if (this.reconnectId || this.manuallyClosed || !this.latestResumeToken) {
      return;
    }

    const delay = Math.min(
      RECONNECT_MAX_DELAY_MS,
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts,
    );
    this.reconnectAttempts += 1;
    this.reconnectId = setTimeout(() => {
      this.reconnectId = null;
      this.open();
    }, delay);
  }

  private stopReconnect(): void {
    if (!this.reconnectId) {
      return;
    }

    clearTimeout(this.reconnectId);
    this.reconnectId = null;
  }
}

export const buildLiveRoomWsUrl = (subsUrl: string): string => {
  if (!subsUrl) {
    return '';
  }
  try {
    const url = new URL(subsUrl);
    if (url.protocol === 'https:') {
      url.protocol = 'wss:';
    } else if (url.protocol === 'http:') {
      url.protocol = 'ws:';
    }
    url.pathname = '/flyting/ws';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
};
