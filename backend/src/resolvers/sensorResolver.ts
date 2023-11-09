import { Context } from '../utils';
import { Data, Sensor, SensorDataArgs, SensorResolvers } from './../__generated__/resolvers-types';

const sensor: SensorResolvers = {
    // eslint-disable-next-line require-await
    data: async (
        _parent: Sensor, // eslint-disable-line @typescript-eslint/no-unused-vars
        _sensorDataArgs: Partial<SensorDataArgs>, // eslint-disable-line @typescript-eslint/no-unused-vars
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Data> => {

        console.log('SESNOR', _parent, _sensorDataArgs, _context);

        return Promise.resolve({
            edges: [
                {
                    node: {
                        id: '654d40cf3128e7fc4d6a30e4',
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
