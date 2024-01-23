import { gql } from '@apollo/client';

export const REFRESH = gql`
mutation Mutation($token: JWT!) {
    refresh(token: $token) {
      data {
        accessToken
        refreshToken
      }
    }
  }`;
