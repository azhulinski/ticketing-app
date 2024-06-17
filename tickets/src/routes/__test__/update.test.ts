import request from 'supertest';
import {app} from '../../app';
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";

it('returns 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'title one',
            price: 12
        })
        .expect(404)
});

it('returns 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'title one',
            price: 12
        })
        .expect(401)
});

it('returns 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Ticket 1',
            price: 12
        })
        .expect(201)

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'title one',
            price: 12
        })
        .expect(401)
});

it('returns 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Ticket 1',
            price: 12
        })
        .expect(201)
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 12
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'title one',
            price: 'abc'
        })
        .expect(400)
});

it('updates a ticket provided valid inputs', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Ticket 1',
            price: 21
        })
        .expect(201)

    const ticketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'title one',
            price: 12
        })
        .expect(200)

    expect(ticketResponse.body.title).toEqual('title one')
    expect(ticketResponse.body.price).toEqual(12)
});

it('publishes an event', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Ticket 1',
            price: 21
        })
        .expect(201)

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'title one',
            price: 12
        })
        .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin()

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Ticket 1',
            price: 21
        })
        .expect(201)

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()})
    await ticket!.save()

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'title one',
            price: 12
        })
        .expect(400)

})