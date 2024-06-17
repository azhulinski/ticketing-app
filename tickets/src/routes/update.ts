import express, {Request, Response} from 'express';
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest
} from "@zhulinski/gittix-common";
import {body} from "express-validator";
import {Ticket} from '../models/ticket';
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

export {router as updateRouter};

router.put("/api/tickets/:id",
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title is required'),
        body('price')
            .isNumeric()
            .not()
            .isEmpty()
            .withMessage('price is required and should be alphanumeric')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            throw new NotFoundError()
        }
        if (ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket');
        }
        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError()
        }
        ticket.set({
            title: req.body.title,
            price: req.body.price
        })
        await ticket.save();

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        })

        res.status(200).send(ticket)
    })