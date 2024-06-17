import {ExpirationCompleteEvent, Publisher, Subjects} from '@zhulinski/gittix-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

}