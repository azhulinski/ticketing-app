import {OrderCancelledEvent, Publisher, Subjects} from "@zhulinski/gittix-common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: OrderCancelledEvent["subject"] = Subjects.OrderCancelled;
}