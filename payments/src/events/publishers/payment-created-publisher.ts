import {PaymentCreatedEvent, Publisher, Subjects} from "@zhulinski/gittix-common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

}