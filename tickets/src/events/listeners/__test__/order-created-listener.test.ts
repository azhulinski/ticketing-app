import {OrderCreatedListener} from '../order-created-listener'
import {natsWrapper} from "../../../nats-wrapper";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {OrderCreatedEvent, OrderStatus} from "@zhulinski/gittix-common";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'stand-up',
        price: 12,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: ticket.userId,
        expiresAt: new Date().toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {data, listener, msg, ticket}
}

it('', async () => {
    const {data, listener, msg, ticket} = await setup();

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {data, listener, msg} = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled()
});

it('publishes a ticket updated event', async () => {
    const {data, listener, msg, ticket} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
})