import { Injectable, BadRequestException } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';
import OrderRepository from 'src/order/infrastructure/order.repository';

@Injectable()
export class CancelOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, cancellationReason: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (order.status === 'SHIPPED') {
      throw new BadRequestException('La commande ne peut pas être annulée car elle a déjà été envoyée.');
    }

    order.status = 'CANCELED';
    order.cancellationReason = cancellationReason;
    order.canceledAt = new Date();

    return await this.orderRepository.save(order);
  }
}
