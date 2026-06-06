export interface EventDispatcher {
  dispatch(eventName: string, payload: any): void;
}

export const EVENT_DISPATCHER_PORT = Symbol('EVENT_DISPATCHER_PORT');
