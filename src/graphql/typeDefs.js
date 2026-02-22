const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    hello: String!

    getEmployees: [Employee!]!
    searchEmployeeById(id: ID!): Employee!
    searchEmployeeByDesignationOrDepartment(
      designation: String
      department: String
    ): [Employee!]!
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): User!
    login(usernameOrEmail: String!, password: String!): AuthPayload!

    addEmployee(
      first_name: String!
      last_name: String!
      email: String!
      gender: String!
      designation: String!
      salary: Float!
      date_of_joining: String!
      department: String!
      employee_photo: String
    ): Employee!

    updateEmployee(
      id: ID!
      first_name: String
      last_name: String
      email: String
      gender: String
      designation: String
      salary: Float
      date_of_joining: String
      department: String
      employee_photo: String
    ): Employee!

    deleteEmployee(id: ID!): String!
  }
`;

module.exports = typeDefs;