import { SensorData as SensorDataType } from '../../__generated__/resolvers-types';
import mongoose, { Schema, Types } from 'mongoose';

export type ISensorData = Omit<SensorDataType, 'id' | '__typename'> & {
    user: Types.ObjectId;
    sensor: Types.ObjectId;
};

const sensorDataSchema = new Schema<ISensorData>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sensor: {
        type: Schema.Types.ObjectId,
        ref: 'Sensor',
        required: true
    },
    dateTime: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    numericValue: {
        type: Number,
        required: true
    },
    rawValue: {
        type: String,
        required: true
    }
});

export const SensorData = mongoose.model<ISensorData>('SensorData', sensorDataSchema);
