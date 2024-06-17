import request from 'supertest';
import {app} from '../../app';
import {Ticket} from "../../models/ticket";
import {Order, OrderStatus} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";
import mongoose from "mongoose";

it('it marks an order as cancelled', async () => {
    const cookie = global.signin()

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: `stand-up`,
        price: 7
    })
    await ticket.save();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ticketId: ticket.id})

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200)
    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
});

it('returns an error if one users tries to cancel another user order', async () => {
    const cookie_one = global.signin()
    const cookie_two = global.signin()

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: `stand-up`,
        price: 7
    })
    await ticket.save();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie_one)
        .send({ticketId: ticket.id})

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie_two)
        .send()
        .expect(401)
});

it('emits an order cancelled event', async () => {
    const cookie = global.signin()

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: `stand-up`,
        price: 7
    })
    await ticket.save();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ticketId: ticket.id})

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()

    expect(natsWrapper.client.publish).toHaveBeenCalled()
});