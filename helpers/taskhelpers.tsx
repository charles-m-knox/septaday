import { Task } from "../models/Task";

export const getCompletedTasks = (tasks: Task[]): number => {
    return tasks.reduce((acc: number, task: Task): number => acc + (task.completed ? 1 : 0), 0);
}
