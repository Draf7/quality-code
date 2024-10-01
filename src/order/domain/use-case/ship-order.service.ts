import { NotFoundException } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';
import OrderRepository from 'src/order/infrastructure/order.repository';

export class ShipOrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  public async shipOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Pas de commande');
    }

    order.ship();

    return this.orderRepository.save(order);
  }
}
