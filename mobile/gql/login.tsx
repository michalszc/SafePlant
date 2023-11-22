import { gql } from "@apollo/client";

export const LOGIN = gql `
mutation Mutation($loginEmail2: String!, $loginPassword2: String!) {
    login(email: $loginEmail2, password: $loginPassword2) {
      data {
        accessToken
        refreshToken
      }
    }
  }`;