import { BadRequestException, Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';
import { CreateOrderService } from '../domain/use-case/create-order.service';
import { ShipOrderService } from '../domain/use-case/ship-order.service'; // Importer le service ShipOrderService

export interface ItemDetail {
  productName: string;
  price: number;
}

export interface CreateOrder {
  items: ItemDetail[];
  customerName: string;
  shippingAddress: string;
  invoiceAddress: string;
}

@Controller('/orders')
export class OrderController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly shipOrderService: ShipOrderService,
  ) {}

  @Get()
  async getOrders() {
    return 'All orders';
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrder): Promise<string> {
    return this.createOrderService.execute(createOrderDto);
  }

  @Put(':id/pay')
  async payOrder(@Param('id') id: string): Promise<Order> {
    return this.payOrder(id);
  }

  @Put(':id/shipping-address')
  async addShippingAddress(
    @Param('id') id: string,
    @Body('shippingAddress') shippingAddress: string
  ): Promise<Order> {
    const order = await this.shipOrderService.addShippingAddress(id, shippingAddress);
    return order;
  }
}
