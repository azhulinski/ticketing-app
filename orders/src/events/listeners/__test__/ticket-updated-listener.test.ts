import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {TicketUpdatedEvent} from "@zhulinski/gittix-common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'stand-up',
        price: 12
    })
    await ticket.save()

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'concert',
        price: 9,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return {listener, data, ticket, msg};
}

it('finds, updates and saves a ticket', async () => {
    const {listener, data, ticket, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const {listener, data, ticket, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled()
});

it('does not call ack if the event has a skipped version number', async () => {
    const {listener, data, ticket, msg} = await setup();
    data.version = 5;
    try {
        await listener.onMessage(data, msg);
    } catch (error) {
        console.error(error);
        return;
    }
    expect(msg.ack).not.toHaveBeenCalled()
})