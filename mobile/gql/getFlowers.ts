import { gql } from '@apollo/client'

export const GET_FLOWERS = gql`
query Query {
    flowers {
      edges {
        node {
          name
          id
        }
      }
    }
  }
`
  