import { gql } from '@apollo/client';

export const REMOVE_FLOWER = gql`
mutation RemoveFlower($removeFlowerId: ObjectID!) {
    removeFlower(id: $removeFlowerId) {
      status
    }
  }`;
