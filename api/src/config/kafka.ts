import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { logger } from '../utils/logger';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'docme-api',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      logger.info('Kafka producer connected successfully');
    } catch (error) {
      logger.error('Failed to connect Kafka producer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      
      // Disconnect all consumers
      for (const [groupId, consumer] of this.consumers) {
        await consumer.disconnect();
        logger.info(`Kafka consumer ${groupId} disconnected`);
      }
      
      logger.info('Kafka connections closed');
    } catch (error) {
      logger.error('Error disconnecting Kafka:', error);
    }
  }

  async publishEvent(topic: string, event: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{
          key: event.id || event.userId || Date.now().toString(),
          value: JSON.stringify({
            ...event,
            timestamp: new Date().toISOString(),
            eventId: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
        }]
      });
      
      logger.info(`Event published to topic ${topic}:`, event);
    } catch (error) {
      logger.error(`Failed to publish event to topic ${topic}:`, error);
      throw error;
    }
  }

  async createConsumer(
    groupId: string, 
    topics: string[], 
    messageHandler: (payload: EachMessagePayload) => Promise<void>
  ): Promise<Consumer> {
    const consumer = this.kafka.consumer({ 
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });

    try {
      await consumer.connect();
      await consumer.subscribe({ topics, fromBeginning: false });
      
      await consumer.run({
        eachMessage: async (payload) => {
          try {
            await messageHandler(payload);
          } catch (error) {
            logger.error(`Error processing message from topic ${payload.topic}:`, error);
          }
        }
      });

      this.consumers.set(groupId, consumer);
      logger.info(`Kafka consumer ${groupId} connected and subscribed to topics:`, topics);
      
      return consumer;
    } catch (error) {
      logger.error(`Failed to create consumer ${groupId}:`, error);
      throw error;
    }
  }
}

// Kafka Topics
export const KAFKA_TOPICS = {
  USER_EVENTS: 'user-events',
  FILE_CONVERSION_EVENTS: 'file-conversion-events',
  PAYMENT_EVENTS: 'payment-events',
  AUDIT_EVENTS: 'audit-events',
  NOTIFICATION_EVENTS: 'notification-events'
} as const;

// Event Types
export const EVENT_TYPES = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  FILE_UPLOADED: 'file.uploaded',
  CONVERSION_STARTED: 'conversion.started',
  CONVERSION_COMPLETED: 'conversion.completed',
  CONVERSION_FAILED: 'conversion.failed',
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled'
} as const;

// Global Kafka instance
export const kafkaService = new KafkaService();