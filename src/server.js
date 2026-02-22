// Zaki Mohammed - 101507934

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: "/graphql",
  });

  const PORT = process.env.PORT || 8081;

  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer();