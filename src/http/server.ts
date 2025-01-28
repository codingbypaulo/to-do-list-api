import { Elysia } from "elysia";
import chalk from "chalk";

const server = new Elysia();

server.listen(process.env.PORT!, async () => {
  console.log(chalk.green("Server running!"));
});