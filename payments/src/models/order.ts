import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import {OrderStatus} from "@zhulinski/gittix-common";

export {OrderStatus};

interface OrderAttributes {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attributes: OrderAttributes): OrderDoc;
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
        price: {
            type: Number,
            required: true
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
    return new Order({
        _id: attributes.id,
        version: attributes.version,
        price: attributes.price,
        userId: attributes.userId,
        status: attributes.status
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order};