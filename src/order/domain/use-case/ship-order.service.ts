import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Order, OrderStatus } from 'src/order/domain/entity/order.entity';
import OrderRepository from 'src/order/infrastructure/order.repository';

export class ShipOrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  public async addShippingAddress(orderId: string, shippingAddress: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Pas de commande');
    }

    if (!order.orderItems || order.orderItems.length <= 3) {
      throw new BadRequestException("L'ajout de l'adresse de livraison n'est possible que si la commande contient plus de 3 items.");
    }

    order.price += Order.DELIVERY_FEE;

    order.shippingAddress = shippingAddress;
    order.shippingAddressSetAt = new Date();

    if (order.status !== OrderStatus.PENDING && !order.shippingAddress) {
      throw new BadRequestException("La livraison est possible uniquement si la commande est en cours ou si l'adresse de livraison a été renseignée.");
    }

    return this.orderRepository.save(order);
  }
  

  public async shipOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Pas de commande');
    }

    order.ship();

    return this.orderRepository.save(order);
  }
}
