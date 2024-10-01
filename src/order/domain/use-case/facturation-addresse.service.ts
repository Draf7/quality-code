import { Injectable, BadRequestException } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';
import OrderRepository from 'src/order/infrastructure/order.repository';

@Injectable()
export class SetInvoiceAddressUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, invoiceAddress?: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order.shippingAddress) {
      throw new BadRequestException('L\'adresse de livraison doit être renseignée avant de définir l\'adresse de facturation.');
    }

    order.invoiceAddress = invoiceAddress || order.shippingAddress;

    return await this.orderRepository.save(order);
  }
}
