import { BadRequestException, Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';
import { CreateOrderService } from '../domain/use-case/create-order.service';
import OrderRepository from 'src/order/infrastructure/order.repository';
import { NotFoundException } from '@nestjs/common';

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
    private readonly orderRepository: OrderRepository // Ajout du repository ici pour la gestion des commandes
  ) {}

  @Get()
  async getOrders() {
    return 'All orders'; // À remplacer par la logique de récupération des commandes
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrder): Promise<string> {
    return this.createOrderService.execute(createOrderDto);
  }

  @Put(':id/pay')
  async payOrder(@Param('id') id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Pas de commande');
    }

    order.pay();
    return this.orderRepository.save(order);
  }

  @Put(':id/shipping-address')
  async addShippingAddress(
    @Param('id') id: string,
    @Body('shippingAddress') shippingAddress: string
  ): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Pas de commande');
    }
    
    order.addShippingAddress(shippingAddress);
    return this.orderRepository.save(order);
  }
}
