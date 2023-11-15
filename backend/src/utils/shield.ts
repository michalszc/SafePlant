import { or, rule, shield } from "graphql-shield";

const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    return ctx.user !== null;
});

const isGuest = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    return ctx.user === null;
});

export const permissions = shield({
    Query: {
        '*': isAuthenticated
    },
    Mutation: {
        '*': isAuthenticated,
        login: or(isAuthenticated, isGuest),
        signUp: isGuest
    },
    Subscription: {
        '*': isAuthenticated
    },
    Sensor: {
        '*': isAuthenticated
    }
});
