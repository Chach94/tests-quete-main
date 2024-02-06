import assert from "assert";
import Book from "../src/entities/book.entity";
import BookResolver from "../src/resolvers/book.resolver";
import {
    IMockStore,
  addMocksToSchema,
  createMockStore,
} from "@graphql-tools/mock";
import { ApolloServer } from "@apollo/server";
import { buildSchemaSync } from "type-graphql";
import { printSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";

export const LIST_BOOKS = `#graphql
    query Books {
        books {
            id
        }
    }
`;
type ResponseData = {
    books: Book[];
  };

const booksData: Book[] = [
  { id: "1", title: "Mon Livre 1" },
  { id: "2", title: "Mon Livre 2" },
];

let server: ApolloServer;


const baseSchema = buildSchemaSync({
  resolvers: [BookResolver],
  authChecker: () => true,
});

const schemaString = printSchema(baseSchema);
const schema = makeExecutableSchema({ typeDefs: schemaString });


beforeAll(async () => {
  const store = createMockStore({ schema });

  const resolvers = (store: IMockStore) => ({ //resolvers est une fonction qui reçoit le store en argument!
    Query: {
      books() {
        return store.get("Query", "ROOT", "books");
      },
    },
  });

  server = new ApolloServer({
    schema: addMocksToSchema({
      schema: baseSchema,
      store,
    }),
  });

  //remplissage du store
  store.set("Query", "ROOT", "books", booksData);
});

describe("Test sur les livres", () => {
    it("Récupération des livres depuis le store", async () => {
      const response = await server.executeOperation<ResponseData>({
        query: LIST_BOOKS,
      });
  
      assert(response.body.kind === "single");
      expect(response.body.singleResult.data).toEqual({
        books: [{ id: "1" }, { id: "2" }],
      });
    });
  });