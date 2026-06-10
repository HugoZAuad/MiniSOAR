import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitterAdapter } from './event-emitter.adapter';

describe('EventEmitterAdapter', () => {
  let adapter: EventEmitterAdapter;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitterAdapter,
        {
          provide: EventEmitter2,
          useValue: { emit: vi.fn() },
        },
      ],
    }).compile();

    adapter = module.get<EventEmitterAdapter>(EventEmitterAdapter);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('deve disparar o evento corretamente através do EventEmitter2', () => {
    const eventName = 'threat.detected';
    const payload = { id: 'soc-123', severity: 5 };

    adapter.dispatch(eventName, payload);

    expect(eventEmitter.emit).toHaveBeenCalledWith(eventName, payload);
  });
});
