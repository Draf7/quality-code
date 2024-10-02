import { Injectable } from '@nestjs/common';
import { Order } from 'src/order/domain/entity/order.entity';

@Injectable()
export class OrderValidatorService {
  validate(order: Order): void {
    const isValid = order.isValid();
    if (!isValid) {
      throw new Error('Order validation failed');
    }
  }
}
