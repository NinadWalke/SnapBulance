import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Empty @Catch() means it catches EVERYTHING
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine the status code
    const status = 
      exception instanceof HttpException 
        ? exception.getStatus() 
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine the error message
    const message = 
      exception instanceof HttpException 
        ? exception.getResponse() 
        : 'Internal server error';

    // Log the error on the backend for your eyes only
    console.error(`[${request.method}] ${request.url} - Status: ${status}`, exception);

    // Send a sanitized, consistent response to the frontend
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || message,
    });
  }
}