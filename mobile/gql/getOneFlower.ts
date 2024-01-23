import { gql } from '@apollo/client';

export const GET_FLOWER = gql`
query Query($flowerId: ObjectID!) {
    flower(id: $flowerId) {
      humidity {
        frequency
        validRange {
          min
          max
        }
      }
      name
      temperature {
        frequency
        validRange {
          max
          min
        }
      }
    }
  }
`;
