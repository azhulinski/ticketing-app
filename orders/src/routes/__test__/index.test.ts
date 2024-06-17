import request from 'supertest';
import {app} from '../../app';
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

const createOrders = async (i: number, cookie: string[]) => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: `stand-up #${i}`,
        price: 7
    })
    await ticket.save();

    return request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ticketId: ticket.id})
}

it('fetches orders for a particular user', async () => {
    const cookie_one = global.signin()
    const cookie_two = global.signin()

    const tickets = []

    for (let i = 1; i <= 5; i++) {
        const {body: ticket} = await createOrders(i, cookie_one);
        tickets.push(ticket)
    }

    for (let i = 1; i <= 3; i++) {
        await createOrders(i, cookie_two);
    }

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie_one)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(5)
});