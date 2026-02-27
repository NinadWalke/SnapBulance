import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // frontend URL here: http://localhost:5173
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  handleConnection(client: Socket) {
    console.log(`🟢 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id}`);
  }
  // It's like: POST for Sockets
  @SubscribeMessage('pingServer')
  handlePing(client: Socket, payload: any): void {
    console.log(`Received ping from ${client.id} with data:`, payload);
    // Send a response back to the specific client
    client.emit('pongClient', { message: 'Hello from NestJS!' });
  }
  // 1. Join a trip room
  @SubscribeMessage('joinTrip')
  handleJoinTrip(client: Socket, tripId: string): void {
    client.join(tripId);
    console.log(`Client joined trip room ${tripId}`);
  }
  // 2. Handle chat messages
  @SubscribeMessage('sendChat')
  handleSendChat(
    client: Socket,
    payload: {
      tripId: string;
      senderName: string;
      message: string;
      senderId: string;
    },
  ): void {
    console.log(
      `Chat in ${payload.tripId} from ${payload.senderName}: ${payload.message}`,
    );
    // Broadcast to everyone in the room using emit
    this.server.to(payload.tripId).emit('receiveChat', {
      senderName: payload.senderName,
      senderId: payload.senderId,
      message: payload.message,
      timestamp: new Date().toISOString(),
    })
  }
}
