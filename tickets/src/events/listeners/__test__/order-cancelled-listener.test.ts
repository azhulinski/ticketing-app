import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {OrderCancelledEvent} from "@zhulinski/gittix-common";
import {Message} from "node-nats-streaming";
import {OrderDeletedListener} from "../order-deleted-listener";

const setup = async () => {

    const listener = new OrderDeletedListener(natsWrapper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString()

    const ticket = Ticket.build({
        title: 'stand-up',
        price: 12,
        userId: new mongoose.Types.ObjectId().toHexString()
    })

    ticket.set({orderId})

    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {data, listener, msg, ticket}
}

it('updates the ticket, publishes an event and acks te message', async () => {
    const {data, listener, msg, ticket} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()

})