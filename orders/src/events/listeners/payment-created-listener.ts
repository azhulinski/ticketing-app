import {Listener, OrderStatus, PaymentCreatedEvent, Subjects} from "@zhulinski/gittix-common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from './queue-group-name';
import {Order} from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    queueGroupName: string = queueGroupName;
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

    async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('order with the given id is not found');
        }

        order.set({
            status: OrderStatus.Completed
        });

        await order.save();

        msg.ack();
    }

}