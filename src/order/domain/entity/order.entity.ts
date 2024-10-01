import { OrderItem } from '../entity/order-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { CreateOrderCommand, ItemDetailCommand } from '../use-case/create-order.service';

export enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPING_ADDRESS_SET = 'SHIPPING_ADDRESS_SET',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

@Entity()
export class Order {
  static MAX_ITEMS = 5;
  static AMOUNT_MINIMUM = 5;
  static SHIPPING_COST = 5;
  static AMOUNT_MAXIMUM = 500;

  @CreateDateColumn()
  @Expose({ groups: ['group_orders'] })
  createdAt: Date;

  @PrimaryGeneratedColumn()
  @Expose({ groups: ['group_orders'] })
  id: string;

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  price: number;

  @Column()
  @Expose({ groups: ['group_orders'] })
  customerName: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    nullable: true,
    cascade: true,
  })
  @Expose({ groups: ['group_orders'] })
  orderItems: OrderItem[];

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  shippingAddress: string | null;

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  invoiceAddress: string | null;

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  shippingAddressSetAt: Date | null;

  @Column()
  @Expose({ groups: ['group_orders'] })
  status: string;

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  paidAt: Date | null;

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  canceledAt: Date | null;  // Date d'annulation de la commande

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  cancellationReason: string | null;  // Raison de l'annulation

  constructor(createOrderCommand: CreateOrderCommand) {
    const { customerName, items, shippingAddress, invoiceAddress } = createOrderCommand;

    if (!customerName || !items || items.length === 0) {
      throw new BadRequestException('Les informations client ou les articles de la commande sont manquants.');
    }

    if (items.length > Order.MAX_ITEMS) {
      throw new BadRequestException(
        `Impossible de passer une commande avec plus de ${Order.MAX_ITEMS} articles.`,
      );
    }

    const totalAmount = this.calculateOrderAmount(items);

    if (totalAmount < Order.AMOUNT_MINIMUM) {
      throw new BadRequestException(
        `Le montant total de la commande ne peut pas être inférieur à ${Order.AMOUNT_MINIMUM}€.`,
      );
    }

    this.customerName = customerName;
    this.orderItems = this.mapItemsToOrderItems(items);
    this.shippingAddress = shippingAddress;
    this.invoiceAddress = invoiceAddress;
    this.status = OrderStatus.PENDING;
    this.price = totalAmount;
    this.createdAt = new Date();
  }

  private calculateOrderAmount(items: ItemDetailCommand[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  private mapItemsToOrderItems(items: ItemDetailCommand[]): OrderItem[] {
    return items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.productName = item.productName;
      orderItem.price = item.price;
      return orderItem;
    });
  }

  pay(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Commande déjà payée');
    }

    if (this.price > Order.AMOUNT_MAXIMUM) {
      throw new Error('Montant maximum dépassé');
    }

    this.status = OrderStatus.PAID;
    this.paidAt = new Date();
  }

  setShippingAddress(customerAddress: string): void {
    if (
      this.status !== OrderStatus.PENDING &&
      this.status !== OrderStatus.SHIPPING_ADDRESS_SET
    ) {
      throw new Error('Commande non payée');
    }

    if (this.orderItems.length > Order.MAX_ITEMS) {
      throw new Error('Trop d’articles');
    }

    this.status = OrderStatus.SHIPPING_ADDRESS_SET;
    this.shippingAddressSetAt = new Date();
    this.shippingAddress = customerAddress;
    this.price += Order.SHIPPING_COST;
  }
}
