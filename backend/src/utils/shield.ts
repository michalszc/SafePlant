import { or, rule, shield, inputRule, and } from 'graphql-shield';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, require-await
const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    if (ctx.user === null) {
        return new Error('Not Authorised!');
    }

    return true;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars, require-await
const isGuest = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    if (ctx.user !== null) {
        return new Error('Already authenticated!');
    }

    return true;
});

const validateLoginInput = inputRule('Login Input')(
    (yup) =>
        yup.object({
            email: yup.string().email().required(),
            password: yup.string().min(3).max(20).required()
        })
);

const validateSignUpInput = inputRule('Sign Up Input')(
    (yup) =>
        yup.object({
            email: yup.string().email().required(),
            password: yup.string().min(3).max(20).required(),
            name: yup.string().min(3).max(20).required()
        })
);

const validateRefreshInput = inputRule('Refresh Input')(
    (yup) =>
        yup.object({
            token: yup.string().matches(/^[0-9a-z\-_]+?\.[0-9a-z\-_]+?\.([0-9a-z\-_]+)?$/i).required()
        })
);

const validateAddFlowerInput = inputRule('Add Flower Input')(
    (yup) =>
        yup.object({
            input: yup.object({
                name: yup.string().min(1).max(100).required(),
                humidity: yup.object({
                    frequency: yup.number().positive().required(),
                    validRange: yup.object({
                        min: yup.number().positive().required(),
                        max: yup.number().positive().required()
                    }).required()
                }).required(),
                temperature: yup.object({
                    frequency: yup.number().positive().required(),
                    validRange: yup.object({
                        min: yup.number().positive().required(),
                        max: yup.number().positive().required()
                    }).required()
                }).required()
            }).required()
        })
);

const validateUpdateFlowerInput = inputRule('Update Flower Input')(
    (yup) =>
        yup.object({
            id: yup.string().matches(/^[a-f\d]{24}$/i).required(),
            input: yup.object({
                name: yup.string().min(1).max(100),
                humidity: yup.object({
                    frequency: yup.number().positive().required(),
                    validRange: yup.object({
                        min: yup.number().positive().required(),
                        max: yup.number().positive().required()
                    }).required()
                }).default(undefined),
                temperature: yup.object({
                    frequency: yup.number().positive().required(),
                    validRange: yup.object({
                        min: yup.number().positive().required(),
                        max: yup.number().positive().required()
                    }).required()
                }).default(undefined)
            }).required()
        })
);

const validateID = inputRule('Remove Flower Input')(
    (yup) =>
        yup.object({
            id: yup.string().matches(/^[a-f\d]{24}$/i).required()
        })
);

const validateFlowersInput = inputRule('Flowers Input')(
    (yup) =>
        yup.object({
            first: yup.number().min(1).max(10000),
            last: yup.number().min(1).max(10000),
            after: yup.string().matches(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, 'Invalid cursor'),
            before: yup.string().matches(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, 'Invalid cursor'),
            filter: yup.object({
                name: yup.object({
                    eq: yup.string().min(1).max(100),
                    ne: yup.string().min(1).max(100),
                    contains: yup.string().min(1).max(100),
                    startsWith: yup.string().min(1).max(100)
                }).default(undefined),
                id: yup.object({
                    eq: yup.string().matches(/^[a-f\d]{24}$/i),
                    ne: yup.string().matches(/^[a-f\d]{24}$/i),
                    in: yup.array().of(yup.string().matches(/^[a-f\d]{24}$/i)),
                    nin: yup.array().of(yup.string().matches(/^[a-f\d]{24}$/i))
                }).default(undefined)
            }).default(undefined),
            sort: yup.object({
                field: yup.string().oneOf(['ID', 'NAME']).required(),
                order: yup.string().oneOf(['ASC', 'DESC']).required()
            }).default(undefined)
        })
);

const validateSensorDataInput = inputRule('Sensor Data Input')(
    (yup) =>
        yup.object({
            first: yup.number().min(1).max(10000),
            last: yup.number().min(1).max(10000),
            after: yup.string().matches(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, 'Invalid cursor'),
            before: yup.string().matches(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, 'Invalid cursor'),
            filter: yup.object({
                dateTime: yup.object({
                    gt: yup.date(),
                    gte: yup.date(),
                    lt: yup.date(),
                    lte: yup.date()
                }).default(undefined),
                id: yup.object({
                    eq: yup.string().matches(/^[a-f\d]{24}$/i),
                    ne: yup.string().matches(/^[a-f\d]{24}$/i),
                    in: yup.array().of(yup.string().matches(/^[a-f\d]{24}$/i)),
                    nin: yup.array().of(yup.string().matches(/^[a-f\d]{24}$/i))
                }).default(undefined)
            }).default(undefined),
            sort: yup.object({
                field: yup.string().oneOf(['DATETIME', 'TIMESTAMP', 'VALUE']).required(),
                order: yup.string().oneOf(['ASC', 'DESC']).required()
            }).default(undefined)
        })
);

export const permissions = shield({
    Query: {
        user: isAuthenticated,
        sensor: and(isAuthenticated, validateID),
        flower: and(isAuthenticated, validateID),
        flowers: and(isAuthenticated, validateFlowersInput)
    },
    Mutation: {
        '*': isAuthenticated,
        login: and(or(isAuthenticated, isGuest), validateLoginInput),
        signUp: and(isGuest, validateSignUpInput),
        refresh: and(isAuthenticated, validateRefreshInput),
        addFlower: and(isAuthenticated, validateAddFlowerInput),
        updateFlower: and(isAuthenticated, validateUpdateFlowerInput),
        removeFlower: and(isAuthenticated, validateID)
    },
    Subscription: {
        latestSensorData: and(isAuthenticated, validateID)
    },
    Sensor: {
        '*': and(isAuthenticated, validateSensorDataInput)
    }
},
{
    allowExternalErrors: true
});
