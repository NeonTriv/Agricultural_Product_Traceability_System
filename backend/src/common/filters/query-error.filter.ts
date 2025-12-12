import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Global exception filter for TypeORM QueryFailedError
 * Converts cryptic database constraint errors into user-friendly messages
 */
@Catch(QueryFailedError)
export class QueryErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryErrorFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;

    // Log the full error for debugging
    this.logger.error(`QueryFailedError: ${message}`);

    // Try to provide helpful messages for common FK violations
    let userMessage = message;

    // Check for FK constraint violations
    if (message.includes('REFERENCE constraint')) {
      // Extract table and column info if possible
      if (message.includes('STORED_IN')) {
        userMessage = `Cannot delete: Item is stored in warehouse. Please remove from storage first (Storage > Stored Items).`;
      } else if (message.includes('PROCESSING')) {
        userMessage = `Cannot delete: Item has processing operations. Please delete them first (Processing > Operations).`;
      } else if (message.includes('SHIP_BATCH')) {
        userMessage = `Cannot delete: Shipment contains batches. Please remove them first (Logistics > Shipments).`;
      } else if (message.includes('FARM')) {
        userMessage = `Cannot delete: Province has farms. Please delete them first (Farms tab).`;
      } else if (message.includes('WAREHOUSE')) {
        userMessage = `Cannot delete: Province has warehouses. Please delete them first (Storage > Warehouses).`;
      } else if (message.includes('TRANSPORT_LEG')) {
        userMessage = `Cannot delete: Item has transport legs. Please delete them first (Logistics > Transport Legs).`;
      } else {
        userMessage = `Cannot delete: Item has related records. Please delete the related records first.`;
      }
    }

    // Return as BadRequestException to the frontend
    const badRequest = new BadRequestException(userMessage);
    response.status(badRequest.getStatus()).json({
      statusCode: badRequest.getStatus(),
      message: userMessage,
      error: 'Bad Request',
    });
  }
}
