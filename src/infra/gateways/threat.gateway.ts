import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Threat } from '../../core/domain/entities/threat.entity';

@WebSocketGateway({ cors: true })
export class ThreatGateway {
  @WebSocketServer()
  server!: Server;

  @OnEvent('threat.created')
  handleThreatCreatedEvent(payload: Threat) {
    this.server.emit('threat-alert', payload);
  }
}
