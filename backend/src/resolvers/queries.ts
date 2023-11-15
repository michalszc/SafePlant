import { FilterQuery, SortOrder } from 'mongoose';
import {
    Flower, FlowerSortFieldEnum, Flowers, QueryFlowerArgs, QueryFlowersArgs,
    QueryResolvers, QuerySensorArgs, RequireFields, Sensor,
    SensorTypeEnum, SortOrderEnum, User
} from '../__generated__/resolvers-types';
import { Flower as FlowerModel, Sensor as SensorModel } from '../providers';
import { Context, logger } from '../utils';

const queries: QueryResolvers = {
    flowers: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { first, last, before, after, filter, sort }: Partial<QueryFlowersArgs>,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Flowers> => {
        let sortField: string = '_id';
        let sortOrder: number = 1;
        if (sort) {
            if (sort.field === FlowerSortFieldEnum.Id) {
                sortField = '_id';
            } else if (sort.field === FlowerSortFieldEnum.Name) {
                sortField = 'name';
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

        let filters: FilterQuery<typeof FlowerModel> = {};
        if (before) {
            const key = sortOrder === 1 ? '$lt' : '$gt';
            filters = { ...filters, _id: { [key]: Buffer.from(before, 'base64').toString('ascii') } };
        } else if (after) {
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
            if (filter.name) {
                if (filter.name.eq) {
                    filters = { ...filters, name: filter.name.eq };
                } else if (filter.name.ne) {
                    filters = { ...filters, name: { $ne: filter.name.ne } };
                } else if (filter.name.contains) {
                    filters = { ...filters, name: { $regex: filter.name.contains } };
                } else if (filter.name.startsWith) {
                    filters = { ...filters, name: { $regex: `^${filter.name.startsWith}` } };
                }
            }
        }

        return FlowerModel.find(filters)
            .sort({ [sortField]: sortOrder as SortOrder })
            .limit(resultLimit)
            .populate('humidity')
            .populate('temperature')
            .then(async flowers => {
                const startCursor = flowers ? Buffer.from(flowers.at(0)?._id.toString() ?? '').toString('base64') : null;
                const endCursor = flowers ? Buffer.from(flowers.at(-1)?._id.toString() ?? '').toString('base64') : null;

                let hasNextPage = false;
                let hasPreviousPage = false;

                const queries = [];

                if (startCursor) {
                    const key = sortOrder === 1 ? '$lt' : '$gt';
                    queries.push(
                        FlowerModel.find({ ...filters, _id: { [key]: Buffer.from(startCursor, 'base64').toString('ascii') } })
                            .sort({ [sortField]: sortOrder as SortOrder })
                            .limit(1)
                    );
                }

                if (endCursor) {
                    const key = sortOrder === 1 ? '$gt' : '$lt';
                    queries.push(
                        FlowerModel.find({ ...filters, _id: { [key]: Buffer.from(endCursor, 'base64').toString('ascii') } })
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
                    edges: flowers.map(flower => ({
                        node: {
                            id: flower._id.toString(),
                            name: flower.name,
                            humidity: {
                                id: flower.humidity._id.toString(),
                                type: SensorTypeEnum.Humidity,
                                frequency: flower.humidity.frequency,
                                validRange: flower.humidity.validRange,
                                data: null // pass null to resolve this value in Sensor
                            },
                            temperature: {
                                id: flower.temperature._id.toString(),
                                type: SensorTypeEnum.Temperature,
                                frequency: flower.temperature.frequency,
                                validRange: flower.temperature.validRange,
                                data: null // pass null to resolve this value in Sensor
                            }
                        },
                        cursor: Buffer.from(flower._id.toString()).toString('base64')
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
    },
    flower: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id }: RequireFields<QueryFlowerArgs, 'id'>,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Flower> => {
        return FlowerModel.findById(id)
            .populate('humidity')
            .populate('temperature')
            .then(flower => ({
                id,
                name: flower.name,
                humidity: {
                    id: flower.humidity._id.toString(),
                    type: SensorTypeEnum.Humidity,
                    frequency: flower.humidity.frequency,
                    validRange: flower.humidity.validRange,
                    data: null
                },
                temperature: {
                    id: flower.temperature._id.toString(),
                    type: SensorTypeEnum.Temperature,
                    frequency: flower.temperature.frequency,
                    validRange: flower.temperature.validRange,
                    data: null
                }
            }))
            .catch(err => {
                logger.error(err);

                throw err;
            });
    },
    sensor: (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { id }: RequireFields<QuerySensorArgs, 'id'>,
        _context: Context // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<Sensor> => {
        return SensorModel.findById(id)
            .then(sensor => ({
                id,
                type: sensor.type,
                frequency: sensor.frequency,
                validRange: sensor.validRange,
                data: null // pass null to resolve this value in Sensor
            }))
            .catch(err => {
                logger.error(err);

                throw err;
            });
    },
    user: async (
        _: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        __: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
        { user }: Context
    ): Promise<User> => {
        return Promise.resolve({
            id: user.id,
            name: user.name,
            email: user.email
        });
    }
};

export default queries;
