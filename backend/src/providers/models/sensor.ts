import { Sensor as SensorType, SensorTypeEnum } from '../../__generated__/resolvers-types';
import mongoose, { Model, Schema, Types } from 'mongoose';
import { SensorData } from '.';

export type ISensor = Omit<SensorType, 'id' | '__typename' | 'data'> & {
    user: Types.ObjectId;
};

interface SensorModel extends Model<ISensor> {
  removeMany(ids: string[]): Promise<void>;
}

const sensorSchema = new Schema<ISensor, SensorModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
      type: String,
      enum: Object.values(SensorTypeEnum),
      required: true,
    },
    frequency: {
      type: Number,
      required: true,
    },
    validRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    }
});

sensorSchema.statics.removeMany = async function (ids: string[]): Promise<any> {
  return Promise.all([
      Sensor.deleteMany({ _id: { $in: ids} }),
      SensorData.deleteMany({ sensor: { $in: ids} })
  ]);
}

export const Sensor = mongoose.model<ISensor, SensorModel>('Sensor', sensorSchema);
