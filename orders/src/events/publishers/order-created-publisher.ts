import {Publisher, OrderCreatedEvent, Subjects} from "@zhulinski/gittix-common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;
}