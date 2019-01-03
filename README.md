# GraphQL-extends-generator

A tiny module for creating extended graphQL enums, inputs and types.
Just give it a path to source (or sources) and a path to extended (or two or ten or more).
Start it and see extended by your extends source files.

## Installation

Using npm:
```shell
$ npm i -S graphql-extends-generator
```

In Node.js:
```js
const graphqlGenerateExtends = require('graphql-extends-generator');

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
// details in example
```

In the same directories you will found extended graphQl types and etc. In this example they were call like typesGenerated.
Give your params and change names.

## Usage
When you generate extends data you can pass such params:
* sourcePath: String / [String] - A path or an array of paths to the source files
* extendsPath: String / [String] - A path or an array of paths to the extends files

* options { prefix: String, postfix: String, forbiddenDirectives: [String] }
    * prefix - prefix of generated files (prefix='Extended', extends file name='Type.graphql', result=ExtendedType)
    * postfix - postfix of generated files (postfix='Extended', extends file name='Type.graphql', result=TypeExtended)
    * forbiddenDirectives - some directive names, that shouldn't get to the resulting file.
     For example, if you use [Prisma DB](https://www.prisma.io "Prisma's Homepage") and want to extend the datamodel file
      or source files is used by other services with their own directives.


## Results

#### Person
You have this (source)
```
type Person {
  id:ID! @unique
  role: PersonRole @default(value: "MANAGER")
  name: String!
  phone: String!
}

input PersonCreateInput {
  role: PersonRole
  name: String!
  phone: String!
}
```
and this (extends)
```
type Student extends Person {
    group: String!,
    course: Int,
    marks: [Mark!]!
}

input StudentCreateInput extends PersonCreateInput {
    group: String!
    course: Int
}
```
forbiddenDirectives = ['default']
and result is
```
type Student {
  id: ID!  @unique
  role: PersonRole
  name: String!
  phone: String!
  group: String!
  course: Int
  marks: [Mark!]!
}

input StudentCreateInput {
  role: PersonRole
  name: String!
  phone: String!
  group: String!
  course: Int
}
```

#### Cat
You have this (source)
```
enum AnimalRole {
  PACK_LEADER
  ORDINARY
}

type Animal {
  id: ID!,
  name: String,
  role: AnimalRole @default(value: "ORDINARY")
}
// another source
type ListResponse<SomeType> {
  edges: [SomeType]
  count: Int
  page: Int
  justForourSmallParam: Boolean
}

```
and this (extends)
```
type Cat extends Animal {
  suit: String,
  avgClawsLength: Float,
  loves: [Cat]! @isSame
}

enum CatRole extends AnimalRole {
  HARMFUL_LONER
  HOME_PET
}

type CatsResponce extends ListResponse<Cat> {
  serverLoveCats: Boolean!
}
```
forbiddenDirectives = ['default']
and result is
```
type Cat {
  id: ID!
  name: String
  role: AnimalRole
  suit: String
  avgClawsLength: Float
  loves: [Cat]!  @isSame
}

type CatsResponce {
  edges: [Cat]
  count: Int
  page: Int
  justForourSmallParam: Boolean
  serverLoveCats: Boolean!
}

enum CatRole {
 PACK_LEADER
 ORDINARY
 HARMFUL_LONER
 HOME_PET
}```
