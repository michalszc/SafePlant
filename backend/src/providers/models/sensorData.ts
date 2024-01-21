import { SensorData as SensorDataType } from '../../__generated__/resolvers-types';
import mongoose, { Model, Schema, Types } from 'mongoose';
import { Sensor } from './sensor';
import { logger } from '../../utils';

export type ISensorData = Omit<SensorDataType, 'id' | '__typename'> & {
    user: Types.ObjectId;
    sensor: Types.ObjectId;
};

interface SensorDataModel extends Model<ISensorData> {
    addData(sensorId: string, timestamp: number, value: number): Promise<ISensorData>;
  }

const sensorDataSchema = new Schema<ISensorData, SensorDataModel>({
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

sensorDataSchema.statics.addData = function (sensorId: string, timestamp: number, value: number): Promise<ISensorData> {
    return Sensor
        .findById(sensorId)
        .then(async sensor => {
            if (!sensor) {
                throw new Error(`Sensor with id ${sensorId} not found`);
            }

            const sensorData = await new SensorData({
                user: sensor.user,
                sensor: sensor.id,
                dateTime: new Date(timestamp).toISOString(),
                timestamp,
                numericValue: value,
                rawValue: value.toString()
            }).save();

            return sensorData;
        })
        .catch(err => {
            logger.error(err.message);

            throw err;
        });
};

export const SensorData = mongoose.model<ISensorData, SensorDataModel>('SensorData', sensorDataSchema);
