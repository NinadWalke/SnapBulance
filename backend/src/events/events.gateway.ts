import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // frontend URL here: http://localhost:5173
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private prisma: PrismaService) {}

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
  async handleSendChat(
    client: Socket,
    payload: {
      tripId: string;
      senderName: string;
      message: string;
      senderId: string;
    },
  ) {
    // 1. Save message to PostgreSQL
    const savedMsg = await this.prisma.chatMessage.create({
      data: {
        tripId: payload.tripId,
        senderId: payload.senderId,
        senderName: payload.senderName,
        message: payload.message,
      },
    });

    // 2. Broadcast the saved timestamp to everyone
    this.server.to(payload.tripId).emit('receiveChat', {
      senderName: savedMsg.senderName,
      senderId: savedMsg.senderId,
      message: savedMsg.message,
      timestamp: savedMsg.timestamp.toISOString(),
    });
  }
  // ... inside EventsGateway class
  // 3. Handle Driver Accepting Trip
  @SubscribeMessage('acceptTrip')
  async handleAcceptTrip(
    client: Socket,
    payload: { tripId: string; driverId: string },
  ) {
    try {
      console.log(
        `User ${payload.driverId} attempting to accept trip ${payload.tripId}`,
      );

      // 1. We received the User.id from React. Let's find their DriverProfile!
      const driverProfile = await this.prisma.driverProfile.findUnique({
        where: { userId: payload.driverId },
      });

      if (!driverProfile) {
        console.error(
          `ERROR: No DriverProfile found for User ID ${payload.driverId}`,
        );
        return; // Stop execution
      }

      // 2. Update the database using the correct DriverProfile ID!
      await this.prisma.trip.update({
        where: { id: payload.tripId },
        data: {
          status: 'ASSIGNED',
          driverId: driverProfile.id, // Correct ID used here
          acceptedAt: new Date(),
        },
      });

      console.log(
        `Trip successfully assigned to DriverProfile: ${driverProfile.id}`,
      );

      // 3. Broadcast to the user waiting in the room
      this.server.to(payload.tripId).emit('tripAccepted', {
        driverId: driverProfile.id,
        message: 'Ambulance is en route!',
        acceptedAt: new Date().toISOString(),
      });
    } catch (error) {
      // If Prisma fails (e.g. invalid Trip ID), it will log here instead of failing silently
      console.error('❌ Error during handleAcceptTrip:', error);
    }
  }
  // 4. Handle Trip Status Updates
  @SubscribeMessage('updateTripStatus')
  handleUpdateTripStatus(client: Socket, payload: any) {
    // Broadcast the new status to the patient waiting in the room
    this.server.to(payload.tripId).emit('tripStatusChanged', payload);
  }
  // Add this inside EventsGateway class
  @SubscribeMessage('driverLocationUpdate')
  handleDriverLocationUpdate(
    client: Socket,
    payload: { tripId: string; lat: number; lng: number },
  ) {
    // Broadcast the exact coordinates to the patient waiting in the room
    this.server.to(payload.tripId).emit('driverLocationUpdated', {
      lat: payload.lat,
      lng: payload.lng,
    });
  }
}
