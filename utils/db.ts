import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

class Database {
    static instance: DB;

    private constructor() {
    }

    static getInstance(): DB {
        if (!Database.instance) {
            Database.instance = new DB('sqlite.db')
        }

        return this.instance
    }

    static async initTables() {
        const tasksTable = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(20) NOT NULL,
                description VARCHAR(100) NOT NULL,
                status VARCHAR(10) NOT NULL,
                dueDate DATETIME
            )
        `

        const db = Database.getInstance()

        try {
            await db.execute(tasksTable)
        } catch (error) {
            console.log({ error })
        }
    }
}

export async function initDB() {
    await Database.initTables()
}

export default Database