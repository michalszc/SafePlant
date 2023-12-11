import { gql } from '@apollo/client'

export const SIGN_UP_MUTATION = gql`
  mutation Mutation($email: String!, $password: String!, $name: String!) {
    signUp(email: $email, password: $password, name: $name) {
      data {
        accessToken
        refreshToken
      }
    }
  }
`
