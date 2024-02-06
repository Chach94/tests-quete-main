//backend/src/lib/datasource_test.ts
import { DataSource } from "typeorm";

export default new DataSource({
  type: "sqlite",
  database: "./demo-test.sqlite",
  synchronize: true,
  entities: ["src/entities/*.ts"],
  logging: ["query", "error"],
});