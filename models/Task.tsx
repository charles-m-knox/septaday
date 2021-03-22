export interface Task {
    name: string;
    id: string;
    completed: boolean; // temporary - we will eventually migrate task completion capabilities to sqlite
}
