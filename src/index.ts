import { Hono } from 'hono'
import {envConfig} from "./config/env";

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


export default {
  port: envConfig.PORT || 8000,
  fetch: app.fetch,
};
