import { Flower as FlowerType } from '../../__generated__/resolvers-types';
import mongoose, { Model, Schema, Types } from 'mongoose';
import { Sensor } from '.';

export type IFlower = Omit<FlowerType, 'id' | '__typename'> & {
    user: Types.ObjectId;
    humidity: Types.ObjectId;
    temperature: Types.ObjectId;
};

interface FlowerModel extends Model<IFlower> {
    removeOne(id: string): Promise<void>;
}

const flowerSchema = new Schema<IFlower, FlowerModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    humidity: {
        type: Schema.Types.ObjectId,
        ref: 'Sensor',
        required: true
    },
    temperature: {
        type: Schema.Types.ObjectId,
        ref: 'Sensor',
        required: true
    }
});

flowerSchema.statics.removeOne = async function (id: string): Promise<any> {
    return Flower.findByIdAndDelete(id).then(flower => Sensor.removeMany([
        flower.humidity._id.toString(),
        flower.temperature._id.toString()
    ]));
}

export const Flower = mongoose.model<IFlower, FlowerModel>('Flower', flowerSchema);
