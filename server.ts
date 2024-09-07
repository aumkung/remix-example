import dotenv from 'dotenv';
import { createRequestHandler } from "@remix-run/express";
import express, { Express } from 'express';
import cors from 'cors';
import { type ServerBuild } from '@remix-run/node'

dotenv.config();

const port = process.env.PORT || 3000;

const app: Express = express();

app.use(cors());

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client")
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : await import("./build/server/index.js");

const serverBuild = build as unknown as ServerBuild;

app.all("*", createRequestHandler({ build: serverBuild }));

app.listen(port, () => {
    console.log(`[INFO]: App listening on http://localhost:${port}`);
});