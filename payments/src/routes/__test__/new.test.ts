import request from 'supertest';
import {app} from '../../app';
import mongoose from "mongoose";
import {Order, OrderStatus} from "../../models/order";
import {Payment} from "../../models/payment";
import {stripe} from '../../stripe'

jest.mock('../../stripe')

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: new mongoose.Types.ObjectId(),
            orderId: new mongoose.Types.ObjectId()
        })
        .expect(404)
})

it('returns 401 when purchasing an order that does not belong to the user', async () => {

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 12,
        status: OrderStatus.Created,
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: new mongoose.Types.ObjectId(),
            orderId: order.id
        })
        .expect(401)
})

it('returns 400 when purchasing a cancelled order', async () => {

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 12,
        status: OrderStatus.Cancelled,
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(order.userId))
        .send({
            token: new mongoose.Types.ObjectId(),
            orderId: order.id
        })
        .expect(400)
})

it('returns 204 with valid inputs', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 12,
        status: OrderStatus.Created,
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(order.userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201)

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(1200);
    expect(chargeOptions.currency).toEqual('usd');
});

it('creates a payment object', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 12,
        status: OrderStatus.Created,
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(order.userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201)

    const payment = await Payment.findOne({
        orderId: order.id
    })

    expect(payment).not.toBeNull();
});