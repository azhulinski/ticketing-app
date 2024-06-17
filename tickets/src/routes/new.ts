import express, {Request, Response} from 'express';
import {requireAuth, validateRequest} from "@zhulinski/gittix-common";
import {body} from "express-validator";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {Ticket} from '../models/ticket';

import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.post('/api/tickets',
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title is required'),
        body('price')
            .not()
            .isEmpty()
            .isNumeric()
            .withMessage('price is required and should be alphanumeric')
    ],
    validateRequest, async (req: Request, res: Response) => {
        const {title, price} = req.body;

        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id
        });

        await ticket.save();

        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        })

        res.status(201).send(ticket);
    })

export {router as createTicketRouter};