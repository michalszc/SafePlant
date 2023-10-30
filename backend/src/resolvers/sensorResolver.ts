import { Context } from '../utils';
import { Data, Sensor, SensorDataArgs, SensorResolvers } from './../__generated__/resolvers-types';

const sensor: SensorResolvers = {
    // eslint-disable-next-line require-await
    data: async (
        _parent: Sensor, // eslint-disable-line @typescript-eslint/no-unused-vars
        _sensorDataArgs: Partial<SensorDataArgs>, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Data> => {
        return Promise.resolve({
            edges: [
                {
                    node: {
                        id: '7fc990e2-463e-45a0-939f-1414206ff1de',
                        dateTime: '2007-12-03T10:15:30Z',
                        timestamp: 1698595357206,
                        numericValue: 45.2,
                        rawValue: '45.2'
                    },
                    cursor: 'ZHVtbXk='
                }
            ],
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null
            }
        });
    }
};

export default sensor;
