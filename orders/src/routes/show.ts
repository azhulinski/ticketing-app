import express, {Request, Response} from 'express';
import {NotAuthorizedError, NotFoundError, requireAuth} from "@zhulinski/gittix-common";
import {Order} from '../models/order'
import {body} from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.get('/api/orders/:orderId',
    requireAuth,
    body('ticketId')
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId should be valid'),
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.status(200).send(order)
    })

export {router as showOrderRouter};