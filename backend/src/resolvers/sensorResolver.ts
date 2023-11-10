import { SortOrder } from 'mongoose';
import { SensorData } from '../providers';
import { Context, logger } from '../utils';
import { Data, Sensor, SensorDataArgs, SensorDataSortFieldEnum, SensorResolvers, SortOrderEnum } from './../__generated__/resolvers-types';

const sensor: SensorResolvers = {
    data: (
        { id }: Sensor, // eslint-disable-line @typescript-eslint/no-unused-vars
        { first, last, before, after, filter, sort }: Partial<SensorDataArgs>,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Data> => {
        let sortField: string = 'dateTime';
        let sortOrder: number = 1;
        if (sort) {
            if (sort.field === SensorDataSortFieldEnum.Datetime) {
                sortField = 'dateTime';
            } else if (sort.field === SensorDataSortFieldEnum.Timestamp) {
                sortField = 'timestamp';
            } else if (sort.field === SensorDataSortFieldEnum.Value) {
                sortField = 'numericValue';
            }

            sortOrder = sort.order === SortOrderEnum.Asc ? 1 : -1;
        }

        let resultLimit = 100;
        if (first) {
            resultLimit = first;
        } else if (last) {
            resultLimit = last;
            sortOrder *= -1;
        }

        let filters: Record<string, any> = {
            sensor: id
        };
        if (before) {
            const key = sortOrder === 1 ? '$lt' : '$gt';
            filters = { ...filters, _id: { [key]: Buffer.from(before, 'base64').toString('ascii') } };
        }else if (after) {
            const key = sortOrder === 1 ? '$gt' : '$lt';
            filters = { ...filters, _id: { [key]: Buffer.from(after, 'base64').toString('ascii') } };
        }

        if (filter) {
            if (filter.id) {
                if (filter.id.eq) {
                    filters = { ...filters, _id: filter.id.eq };
                } else if (filter.id.ne) {
                    filters = { ...filters, _id: { $ne: filter.id.ne } };
                } else if (filter.id.in) {
                    filters = { ...filters, _id: { $in: filter.id.in } };  
                } else if (filter.id.nin) {
                    filters = { ...filters, _id: { $nin: filter.id.nin } };
                }
            }
            if (filter.dateTime) {
                if (filter.dateTime.gt) {
                    filters = { ...filters, timestamp: { $gt: new Date(filter.dateTime.gt) } };
                } else if (filter.dateTime.gte) {
                    filters = { ...filters, timestamp: { $gte: new Date(filter.dateTime.gte) } };
                }
                
                if (filter.dateTime.lt) {
                    filters = { ...filters, timestamp: { ...filters.timestamp, $lt: new Date(filter.dateTime.lt) } };
                } else if (filter.dateTime.lte) {
                    filters = { ...filters, timestamp: { ...filters.timestamp, $lte: new Date(filter.dateTime.lte) } };
                }
            }
        }

        return SensorData.find(filters)
            .sort({ [sortField]: sortOrder as SortOrder })
            .limit(resultLimit)
            .then(async data => {
                const startCursor = data ? Buffer.from(data.at(0)?._id.toString() ?? '').toString('base64') : null;
                const endCursor = data ? Buffer.from(data.at(-1)?._id.toString() ?? '').toString('base64') : null;

                let hasNextPage = false;
                let hasPreviousPage = false;
                
                const queries = [];

                if (startCursor) {
                    const key = sortOrder === 1 ? '$lt' : '$gt';
                    queries.push(
                        SensorData.find({...filters, _id: {[key]: Buffer.from(startCursor, 'base64').toString('ascii') } })
                        .sort({ [sortField]: sortOrder as SortOrder })
                        .limit(1)
                    );
                }

                if (endCursor) {
                    const key = sortOrder === 1 ? '$gt' : '$lt';
                    queries.push(
                        SensorData.find({...filters, _id: {[key]: Buffer.from(endCursor, 'base64').toString('ascii') } })
                        .sort({ [sortField]: sortOrder as SortOrder })
                        .limit(1)
                    );
                }

                if (queries.length) {
                    const [previousPage, nextPage] = await Promise.all(queries);
                    hasPreviousPage = !!previousPage.length;
                    hasNextPage = !!nextPage.length;
                }

                return {
                    edges: data.map(sensorData => ({
                        node: {
                            id: sensorData._id.toString(),
                            dateTime: sensorData.dateTime,
                            timestamp: sensorData.timestamp,
                            numericValue: sensorData.numericValue,
                            rawValue: sensorData.rawValue
                        },
                        cursor: Buffer.from(sensorData._id.toString()).toString('base64')
                    })),
                    pageInfo: {
                        hasNextPage,
                        hasPreviousPage,
                        startCursor,
                        endCursor
                    }
                };
            })
            .catch(err => {
                logger.error(err);

                throw err;
            });
    }
};

export default sensor;
