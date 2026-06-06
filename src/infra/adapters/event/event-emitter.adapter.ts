import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventDispatcher } from '../../../core/domain/ports/event-dispatcher.port';

@Injectable()
export class EventEmitterAdapter implements EventDispatcher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  dispatch(eventName: string, payload: any): void {
    this.eventEmitter.emit(eventName, payload);
  }
}
