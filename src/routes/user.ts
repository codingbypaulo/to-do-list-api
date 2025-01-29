import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = t.Object({
  id: t.String(),
});

export const user = new Elysia()
  .use(
    jwt({
        name: "jwt",
        secret: process.env.SECRET!,
        schema,
    })
  )
  .post("/user", async ({ body, jwt, cookie: { auth }, set }) => {
    const { email, password } = body;

    const userFound = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userFound) {
      const passwordHash = await Bun.password.hash(password);

      const userCreated = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
        },
      });

      if (userCreated) {
        const { id } = userCreated;

        auth.set({
          value: await jwt.sign({ id }),
          httpOnly: true,
          maxAge: 7 * 86400,
          path: '/',
        })

        set.status = "OK";
      } else {
        set.status = "Conflict";
      };
    } else {
      set.status = "Conflict";
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email", }),
      password: t.String({ minLength: 8, }),
    }),
  })
  .post("/user/login", async ({ body, jwt, cookie: { auth }, set }) => {
    const { email, password } = body;

    const userFound = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userFound) {
      const { id, password: passwordHash } = userFound;

      const passwordIsMatch = await Bun.password.verify(password, passwordHash);

      if (passwordIsMatch) {
        auth.set({
          value: await jwt.sign({ id }),
          httpOnly: true,
          maxAge: 7 * 86400,
          path: '/',
        })

        set.status = "OK";
      } else {
        set.status = "Unauthorized";
      };
    } else {
      set.status = "Not Found";
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email", }),
      password: t.String({ minLength: 8, }),
    }),
  });