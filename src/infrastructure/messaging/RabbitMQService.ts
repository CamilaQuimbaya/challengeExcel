// infrastructure/messaging/RabbitMQService.ts
import amqp from 'amqplib';
import { env } from "../../config/env";

class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  async connect() {
    if (!this.connection) {
      this.connection = await amqp.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(env.QUEUE_NAME, { durable: true });
    }
  }

  async publishMessage(message: string) {
    if (!this.channel) await this.connect();
    this.channel?.sendToQueue(env.QUEUE_NAME, Buffer.from(message), { persistent: true });
  }

  async consumeMessages(callback: (msg: amqp.ConsumeMessage | null) => void) {
    if (!this.channel) await this.connect();
    this.channel?.consume(env.QUEUE_NAME, callback, { noAck: true });
  }
}

export default new RabbitMQService();
