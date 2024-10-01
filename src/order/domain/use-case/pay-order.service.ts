import { NotFoundException } from '@nestjs/common';
import { Order, OrderStatus } from 'src/order/domain/entity/order.entity';
import OrderRepository from 'src/order/infrastructure/order.repository';

export class PayOrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  public async payOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Pas de commande');
    }

    order.status = OrderStatus.PAID;
    order.paidAt = new Date('NOW');

    return this.orderRepository.save(order);
  }
}