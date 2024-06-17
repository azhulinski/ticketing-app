import {Publisher, Subjects, TicketCreatedEvent} from "@zhulinski/gittix-common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: TicketCreatedEvent["subject"] = Subjects.TicketCreated;
}