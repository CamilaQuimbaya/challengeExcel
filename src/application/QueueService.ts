import * as amqplib from "amqplib";
import { Connection, Channel } from "amqplib";
import { logger } from "../config/logger";

type MessagePayload = Record<string, unknown>;

class QueueService {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly queueName: string = "upload_tasks";
    private readonly rabbitMQUrl: string =
        process.env.RABBITMQ_URL || "amqp://localhost";
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 10;

    async connect(): Promise<void> {
        try {
            logger.info(`📡 Connecting to RabbitMQ at ${this.rabbitMQUrl}`);
            const connection = await amqplib.connect(this.rabbitMQUrl);
            this.connection = connection;

            const channel = await connection.createChannel();
            this.channel = channel;

            await channel.assertQueue(this.queueName, { durable: true });

            this.connection.on("close", async () => {
                logger.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
                await this.reconnect();
            });

            this.connection.on("error", async (err: Error) => {
                logger.error("❌ RabbitMQ connection error:", err);
                await this.reconnect();
            });

            this.reconnectAttempts = 0;
            logger.info("✅ Connected to RabbitMQ and queue asserted");
        } catch (error) {
            logger.error("❌ Failed to connect to RabbitMQ", error);
            setTimeout(() => this.connect(), 5000);
        }
    }

    getChannel(): Channel | null {
        return this.channel;
    }

    async reconnect(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error("❌ Maximum reconnect attempts reached. Stopping reconnection.");
            return;
        }

        this.reconnectAttempts++;
        logger.warn(`🔄 Reconnecting to RabbitMQ... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        this.connection = null;
        this.channel = null;
        await this.connect();
    }

    async sendMessage(message: MessagePayload): Promise<void> {
        if (!this.channel) {
            logger.warn("⚠️ RabbitMQ channel is not initialized. Retrying connection...");
            await this.connect();
        }

        try {
            if (this.channel) {
                this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
                logger.info(`📩 Message sent to queue '${this.queueName}':`, message);
            }
        } catch (error) {
            logger.error("❌ Error sending message to queue", error);
        }
    }

    async consumeMessages(callback: (msg: MessagePayload, rawMsg: amqplib.Message) => void): Promise<void> {
        if (!this.channel) {
            logger.warn("⚠️ RabbitMQ channel is not initialized. Retrying connection...");
            await this.connect();
        }
    
        try {
            if (this.channel) {
                this.channel.consume(this.queueName, (msg) => {
                    if (msg !== null) {
                        try {
                            const message = JSON.parse(msg.content.toString());
                            logger.info("📨 Message received from queue:", message);
                            callback(message, msg);  // ✅ Ahora pasamos también el mensaje crudo (rawMsg)
                        } catch (error) {
                            logger.error("❌ Error processing message:", error);
                            this.channel?.nack(msg); // ❌ Si hay error, RabbitMQ lo reenvía
                        }
                    }
                }, { noAck: false });  // ✅ Asegúrate de que noAck está en false
                logger.info("🟢 Started consuming messages from queue");
            }
        } catch (error) {
            logger.error("❌ Error starting message consumption:", error);
        }
    }
    
    
    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            logger.info("🔴 RabbitMQ connection closed successfully");
        } catch (error) {
            logger.error("❌ Error closing RabbitMQ connection:", error);
        }
    }
}

export const queueService = new QueueService();
