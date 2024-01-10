import { gql } from '@apollo/client'

export const GET_USER = gql`
query Query {
  user {
    id
  }
}
`
  