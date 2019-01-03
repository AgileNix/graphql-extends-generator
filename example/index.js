const path = require('path');
const graphqlGenerateExtends = require('../src/index');

graphqlGenerateExtends(
  [path.resolve('source.graphql'), path.resolve('generic.source.graphql')],
  [
    path.resolve('Cat/types.graphql'),
    path.resolve('Dog/types.graphql'),
    path.resolve('Student/types.graphql'),
    path.resolve('Teacher/types.graphql'),
  ],
  {
    forbiddenDirectives: ['default'],
    prefix: 'Prefix',
    postfix: 'Postfix',
  }
);

