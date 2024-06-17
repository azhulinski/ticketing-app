import {Listener, OrderCancelledEvent, Subjects} from "@zhulinski/gittix-common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order, OrderStatus} from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    queueGroupName: string = queueGroupName;
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {

        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1,
        });

        if (!order) {
            throw new Error('order not found');
        }

        order.set({status: OrderStatus.Cancelled});

        await order.save()

        // await new TicketUpdatedPublisher(this.client).publish({
        //     id: ticket.id,
        //     version: ticket.version,
        //     title: ticket.title,
        //     price: ticket.price,
        //     userId: ticket.userId,
        //     orderId: ticket.orderId
        // })

        msg.ack();
    }

}