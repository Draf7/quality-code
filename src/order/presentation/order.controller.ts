import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';

interface ItemDetail {
  productName: string;
  price: number;
}

interface CreateOrder {
  items: ItemDetail[];
  customerName: string;
  shippingAddress: string;
  invoiceAddress: string;
}

@Controller('/orders')
export default class OrderController {
  @Get()
  async getOrders() {
    return 'All orders';
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrder): Promise<string> {
    const { items, customerName, shippingAddress, invoiceAddress } =
      createOrderDto;

    if (
      !customerName ||
      !items ||
      items.length === 0 ||
      !shippingAddress ||
      !invoiceAddress
    ) {
      throw new BadRequestException('Missing required fields');
    }

    if (items.length > Order.MAX_ITEMS) {
      throw new BadRequestException(
        'Cannot create order with more than 5 items',
      );
    }

    const totalAmount = this.calculateOrderAmount(items);

    return 'OK';
  }

  private calculateOrderAmount(items: ItemDetail[]): number {
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    if (totalAmount < Order.AMOUNT_MINIMUM) {
      throw new BadRequestException(
        'Cannot create order with total amount less than 10€',
      );
    }

    return totalAmount;
  }
}
