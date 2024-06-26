import mongoose from 'mongoose';
import {natsWrapper} from "./nats-wrapper";
import {app} from './app';
import {OrderCreatedListener} from "./events/listeners/order-created-listener";
import {OrderDeletedListener} from "./events/listeners/order-deleted-listener";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('JWT_KEY must be defined');
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('JWT_KEY must be defined');
    }

    if (!process.env.NATS_URL) {
        throw new Error('JWT_KEY must be defined');
    }

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL)

        natsWrapper.client.on('close', () => {
            console.log('listener disconnected!');
            process.exit();
        })

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderDeletedListener(natsWrapper.client).listen();

        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())
        await mongoose.connect(process.env.MONGO_URI!);

        console.log('Connected to tickets MongoDb');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!');
    });
};

start();
