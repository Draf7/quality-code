import { OrderItem } from '../entity/order-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

@Entity()
export class Order {
  static MAX_ITEMS = 5;

  static AMOUNT_MINIMUM = 5;

  static MAX_PAYMENT_AMOUNT = 500;

  static DELIVERY_FEE = 5;


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
  })
  @Expose({ groups: ['group_orders'] })
  orderItems: OrderItem[];

  @Column({ nullable: true })
  @Expose({ groups: ['group_orders'] })
  shippingAddress: string | null;

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

  pay(): void {

    if (this.status !== OrderStatus.PENDING || this.price > Order.MAX_PAYMENT_AMOUNT) {
      throw new Error('Le paiement ne peut être effectué que si la commande est en attente et que le montant total est inférieur ou égal à 500€.');
    }
    this.status = OrderStatus.PAID;
    this.paidAt = new Date("NOW");
  }

  isPaid(): boolean {
    return this.status === OrderStatus.PAID;
  }  

  ship(): void {
    if (this.status !== OrderStatus.PAID) {
      throw new Error("L'expédition n'est possible que si la commande a été payée.");
    }

    if (!this.shippingAddress) {
      throw new Error("L'expédition n'est pas possible car l'adresse de livraison n'est pas renseignée.");
    }

    this.status = OrderStatus.SHIPPED;
  }

  addShippingAddress(shippingAddress: string): void {
    if (!this.orderItems || this.orderItems.length <= 3) {
      throw new Error("L'ajout de l'adresse de livraison n'est possible que si la commande contient plus de 3 items.");
    }

    this.price += Order.DELIVERY_FEE;

    this.shippingAddress = shippingAddress;
    this.shippingAddressSetAt = new Date();
  }

}