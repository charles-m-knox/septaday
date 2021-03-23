export interface Task {
    name: string;
    id: string;
    completed: boolean; // temporary - we will eventually migrate task completion capabilities to sqlite
    about: string;
    order: number;
    date?: number;
}

export const defaultTasks: Task[] = [
    {
        name: "Consistent Sleep",
        completed: false,
        id: "460fa9ba-f190-4018-85ab-dd9a16aa09a4",
        about: "",
        order: 0,
    },
    {
        name: "Diet",
        completed: false,
        id: "80d92035-1256-4ebf-8dfc-fbeefc3e9ecc",
        about: "",
        order: 1,
    },
    {
        name: "Dental & Physical Hygiene",
        completed: false,
        id: "e409699d-119e-4624-9e7d-e74b2659cf31",
        about: "",
        order: 2,
    },
    {
        name: "Exercise",
        completed: false,
        id: "ebe99dac-f8bb-4ca7-be7c-b0f961895ead",
        about: "",
        order: 3,
    },
    {
        name: "Disconnect 30 minutes (walk)",
        completed: false,
        id: "79e2ba1d-734b-4530-aa86-2a20d4acb4c1",
        about: "",
        order: 4,
    },
    {
        name: "Hour of Focus",
        completed: false,
        id: "3629c196-3979-4de0-bff8-f778d98dafb7",
        about: "",
        order: 5,
    },
    {
        name: "Connect",
        completed: false,
        id: "601e3e1f-7c99-4ad6-9e2e-d2a0f4afd66c",
        about: "",
        order: 6,
    },
];