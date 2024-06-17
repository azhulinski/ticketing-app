import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import {OrderStatus} from "@zhulinski/gittix-common";
import {TicketDoc} from "./ticket";

export {OrderStatus};

interface OrderAttributes {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttributes): OrderDoc;
}

const orderSchema = new mongoose.Schema({
        userId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created
        },
        expiresAt: {
            type: mongoose.Schema.Types.Date
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
        }
    }, {
        toJSON: {
            transform(doc: any, ret: any) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attributes: OrderAttributes) => {
    return new Order(attributes);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order};