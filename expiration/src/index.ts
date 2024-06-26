import {natsWrapper} from "./nats-wrapper";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";


const start = async () => {

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

        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

    } catch (err) {
        console.error(err);
    }
};

start();
