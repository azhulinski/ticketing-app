import request from 'supertest';
import {app} from '../../app';
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

it('fetches the order', async () => {
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

    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200)

    expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one users tries to fetch another order', async () => {
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
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookie_two)
        .send()
        .expect(401)
});

it('returns an error if one users tries to fetch another order', async () => {
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
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookie_two)
        .send()
        .expect(401)
});