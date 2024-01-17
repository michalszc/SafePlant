import { gql } from '@apollo/client'

export const UPDATE_FLOWER = gql`
mutation UpdateFlower($updateFlowerId: ObjectID!, $input: UpdateFlowerInput!) {
    updateFlower(id: $updateFlowerId, input: $input) {
      status
    }
  }
`
