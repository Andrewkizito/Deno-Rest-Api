import Database from "../utils/db.ts";
import { Task } from "../utils/models.ts";

const db = Database.getInstance();

export const getTasks: Deno.ServeHandler = async () => {
  try {
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

    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return new Response(String(error), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
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
        },
      }
    );
  } catch (error) {
    console.error("Error adding task:", error);
    return new Response(String(error), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};

export const deleteTask: Deno.ServeHandler = (_req) => {
  try {
    return new Response(
      JSON.stringify({ message: "Task deleted successfully" }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error adding task:", error);
    return new Response(String(error), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};
