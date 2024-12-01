// utils
import { headers } from "../utils/common.ts";

// DB
import Database from "../storage/db.ts";

// Models
import { Task } from "../utils/models.ts";
import Cache from "../storage/cache.ts";

const db = Database.getInstance();
const cache = Cache.getInstance();

export const getTasks: Deno.ServeHandler = async () => {
  try {
    const cachedTask = await cache.get<Task>('tasks');
    if (cachedTask) {
      return new Response(JSON.stringify(cachedTask), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
    }

    const dbRes = await db.query(
      "SELECT id, title, description, status, dueDate FROM tasks"
    );
    const tasks = dbRes?.map((row) => ({
      id: row[0],
      title: row[1],
      description: row[2],
      status: row[3],
      dueDate: row[4],
    }));

    cache.add('tasks', tasks)

    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return new Response(String(error), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        ...headers,
      },
    });
  }
};

export const getTask: Deno.ServeHandler = async (_req, info) => {
  try {
    const { params } = info as any;

    if (!params?.id || !parseInt(params.id)) {
      return new Response("Invalid or missing task ID", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
    }

    // Check the cache
    const cachedTask = await cache.get<Task>(`task-${params.id}`);
    if (cachedTask) {
      return new Response(JSON.stringify(cachedTask), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
    }

    const dbRes = await db.query(
      `SELECT id, title, description, status, dueDate FROM tasks WHERE id = ${params.id}`
    );

    if (!dbRes.length) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
    }

    const [id, title, description, status, dueDate] = dbRes[0];
    const task = { id, title, description, status, dueDate };

    // Write to cache
    cache.add(`task-${params.id}`, task);

    return new Response(JSON.stringify(task), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return new Response(String(error), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        ...headers,
      },
    });
  }
};

export const addTask: Deno.ServeHandler = async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const body = await req.json();
    const { title, description, status, dueDate } = body;

    const newTask = new Task(title, description, status, new Date(dueDate));

    const escapedTitle = newTask.title;
    const escapedDescription = newTask.description;
    const escapedStatus = newTask.status;
    const escapedDueDate = newTask.dueDate.toISOString();

    const query = `INSERT INTO tasks (title, description, status, dueDate) VALUES ('${escapedTitle}', '${escapedDescription}', '${escapedStatus}', '${escapedDueDate}')`;

    await db.execute(query);

    return new Response(
      JSON.stringify({ message: "Task added successfully", task: newTask }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }
    );
  } catch (error) {
    console.error("Error adding task:", error);
    return new Response(String(error), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        ...headers,
      },
    });
  }
};

export const deleteTask: Deno.ServeHandler = async (_req, info) => {
  try {
    const { params } = info as any;

    if (!params?.id || !parseInt(params.id)) {
      return new Response("Task id is required", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
    }

    const query = `DELETE FROM tasks WHERE id = ${params.id}`;

    await db.execute(query);

    cache.delete(`task-${params.id}`)

    return new Response(
      JSON.stringify({ message: "Task deleted successfully" }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Failed to delete task",
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }
    );
  }
};
