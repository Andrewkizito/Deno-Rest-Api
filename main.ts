import { addTask, deleteTask, getTask, getTasks } from "./controllers/tasks.ts";
import { initDB } from "./storage/db.ts";
import Router from "./router/router.ts";
import { load } from "https://deno.land/std@0.206.0/dotenv/mod.ts";

// Load environment variables from .env file
const env = await load();
const PORT = parseInt(env.PORT || "5000");

// Init db tables
initDB();

const router = new Router(PORT);

// Tasks
router.get("/tasks", getTasks);
router.post("/tasks", addTask);
router.get("/tasks/:id", getTask);
router.delete("/tasks/:id", deleteTask);

Deno.serve(
  {
    port: PORT,
  },
  router.handler
);
