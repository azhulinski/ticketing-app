import {Publisher, Subjects, TicketUpdatedEvent} from "@zhulinski/gittix-common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: TicketUpdatedEvent["subject"] = Subjects.TicketUpdated;
}