import mongoose from "mongoose";
import {OrderCreatedListener} from "../order-created-listener";
import {OrderCreatedEvent} from "@zhulinski/gittix-common";
import {natsWrapper} from "../../../nats-wrapper";
import {Order, OrderStatus} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toISOString(),
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 12
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {data, listener, msg}
}

it('replicates the order info', async () => {
    const {data, listener, msg} = await setup();

    await listener.onMessage(data, msg);
    const order = await Order.findById(data.id)

    expect(order!.price).toEqual(data.ticket.price)
});

it('acks the message', async () => {
    const {data, listener, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled()
});