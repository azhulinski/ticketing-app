import {Listener, OrderCancelledEvent, Subjects} from "@zhulinski/gittix-common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderDeletedListener extends Listener<OrderCancelledEvent> {
    queueGroupName: string = queueGroupName;
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {

        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('ticket not found');
        }

        ticket.set({orderId: undefined});

        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        })

        msg.ack();
    }

}