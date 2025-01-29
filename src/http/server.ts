import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import chalk from "chalk";
import { user } from "../routes/user";
import { task } from "../routes/task";

const server = new Elysia()
  .use(cors())
  .use(swagger())
  .use(user)
  .use(task);

server.listen(process.env.PORT!, async () => {
  console.log(chalk.green("Server running!"));
});