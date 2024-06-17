import express, {Request, Response} from 'express';
import {errorHandler, NotFoundError, requireAuth} from "@zhulinski/gittix-common";
import {Ticket} from '../models/ticket';

const router = express.Router();

export {router as indexRouter};

router.get('/api/tickets', requireAuth, errorHandler, async (req: Request, res: Response) => {
    const tickets = await Ticket.find({
        // orderId: undefined
    });

    if (!tickets) {
        throw new NotFoundError();
    }

    res.status(200).send(tickets);
})