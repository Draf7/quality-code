import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/order/domain/entity/order.entity';
import { OrderValidatorService } from './order-validator.service';
import { EmailNotificationService } from './email-notification.service';
import { SmsNotificationService } from './sms-notification.service';

@Injectable()
export class OrderManagerService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderValidatorService: OrderValidatorService,
    private emailNotificationService: EmailNotificationService,
    private smsNotificationService: SmsNotificationService,
  ) {}

  async processOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
        where: { id: `${orderId}` },
      });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    // Validation de la commande
    this.orderValidatorService.validate(order);

    // Envoi des notifications
    await this.emailNotificationService.sendEmail(order);
    await this.smsNotificationService.sendSms(order);

    // Sauvegarder l'état de la commande
    await this.orderRepository.save(order);
  }
}
