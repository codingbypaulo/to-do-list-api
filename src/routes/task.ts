import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = t.Object({
  id: t.String(),
});

export const task = new Elysia()
  .use(
    jwt({
        name: "jwt",
        secret: process.env.SECRET!,
        schema,
    })
  )
  .get("/task", async ({ jwt, set, cookie: { auth } }) => {
    const user = await jwt.verify(auth.value);

    if (user) {
      const { id } = user;

      const allTasks = await prisma.task.findMany({
        where: {
          userId: id,
        },
      });

      if (allTasks) {
        return allTasks;
      } else {
        set.status = "Internal Server Error";
      };
    } else {
      set.status = "Unauthorized";
    };
  }, {
    detail: {
      tags: ["Task"]
    },
  })
  .post("/task", async ({ body, jwt, set, cookie: { auth } }) => {
    const user = await jwt.verify(auth.value);

    if (user) {
      const { id } = user;
      const { content } = body;

      const taskCreated = await prisma.task.create({
        data: {
          content,
          userId: id,
        },
      });

      if (taskCreated) {
        set.status = "OK";
      } else {
        set.status = "Internal Server Error";
      };
    } else {
      set.status = "Unauthorized";
    };
  }, {
    body: t.Object({
      content: t.String(),
    }),
    detail: {
      tags: ["Task"]
    },
  });