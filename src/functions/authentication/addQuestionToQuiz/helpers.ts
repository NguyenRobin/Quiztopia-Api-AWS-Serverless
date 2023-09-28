export function createKeyCondition(
  primaryKeyGroup: string,
  primaryKey: string,
  sortKeyGroup: string,
  sortKey: string
) {
  return {
    PK: { S: `${primaryKeyGroup}#` + primaryKey },
    SK: { S: `${sortKeyGroup}#` + sortKey },
  };
}

export function createAttributeExpression(newQuestion: any) {
  return {
    ':question': {
      L: [
        {
          M: {
            Question: { S: newQuestion.question },
            Answer: { S: newQuestion.answer },
            Coordinates: {
              M: {
                Latitude: { S: newQuestion.coordinates.latitude },
                Longitude: { S: newQuestion.coordinates.latitude },
              },
            },
          },
        },
      ],
    },
  };
}
