import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';
import { CreateOrderService } from '../domain/use-case/create-order.service';

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
  constructor(private readonly createOrderService: CreateOrderService) {}

  @Get()
  async getOrders() {
    return 'All orders';
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrder): Promise<string> {
    return this.createOrderService.execute(createOrderDto);
  }
}
