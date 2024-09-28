export class Task {
    title: string;
    description: string;
    status: 'pending' | 'completed';
    dueDate: Date;

    constructor(
        title: string,
        description: string,
        status: 'pending' | 'completed' = 'pending',
        dueDate?: Date
    ) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate || new Date();
    }
}
