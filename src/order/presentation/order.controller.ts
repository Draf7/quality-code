import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';
import {
  CreateOrderCommand,
  CreateOrderService,
} from 'src/order/domain/use-case/create-order.service';
import { PayOrderService } from 'src/order/domain/use-case/pay-order.service';
import { CancelOrderUseCase } from '../domain/use-case/annulation-order.service';
import { SetInvoiceAddressUseCase } from '../domain/use-case/facturation-addresse.service';

@Controller('/orders')
export default class OrderController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly payOrderService: PayOrderService,
    private readonly setInvoiceAddressUseCase: SetInvoiceAddressUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  // Route pour créer une nouvelle commande
  @Post()
  async createOrder(
    @Body() createOrderCommand: CreateOrderCommand,
  ): Promise<Order> {
    return this.createOrderService.createOrder(createOrderCommand);
  }

  // Route pour payer une commande
  @Post('/:id/pay')
  async payOrder(@Param('id') id: string): Promise<Order> {
    return await this.payOrderService.payOrder(id);
  }

  // Nouvelle route pour définir l'adresse de facturation
  @Post('/:id/invoice-address')
  async setInvoiceAddress(
    @Param('id') id: string,
    @Body('invoiceAddress') invoiceAddress?: string,
  ): Promise<Order> {
    return await this.setInvoiceAddressUseCase.execute(id, invoiceAddress);
  }

  // Nouvelle route pour annuler une commande
  @Post('/:id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body('cancellationReason') cancellationReason: string,
  ): Promise<Order> {
    return await this.cancelOrderUseCase.execute(id, cancellationReason);
  }
}
