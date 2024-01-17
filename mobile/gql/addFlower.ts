import { gql } from '@apollo/client'

export const ADD_FLOWER = gql`
    mutation AddFlower($input: AddFlowerInput!) {
        addFlower(input: $input) {
        status
    }
  }
`
