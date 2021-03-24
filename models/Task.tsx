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
        about: "Consistent sleep has two parts: Get around 8 hours every night, and follow a consistent bedtime and wake-up time. Getting around 8 hours of sleep is generally recommended for optimal health. It is beneficial to establish a very consistent sleep schedule - once you settle into a routine sleep schedule, you'll find yourself feeling better every day. This is the most important daily task, because without proper sleep, your immune system is compromised, your brain isn't operating at maximum efficiency, your digestive system suffers, you may feel more hungry, and a variety of other problems.",
        order: 0,
    },
    {
        name: "Eat Healthy",
        completed: false,
        id: "80d92035-1256-4ebf-8dfc-fbeefc3e9ecc",
        about: "Establishing a proper diet is critical, and there are two main components: hydration and balanced dietary intake of nutritious foods. Always have a portable water bottle on you at all times, and any time you feel thirsty, drink up. For diet, consider using the Cronometer app to figure out your Basal Metabolic Rate, which helps you understand the number of calories your body is estimated to burn every day. The Cronometer app will also guide you in figuring out proper nutrient and vitamin balances. Essentially, you want to eat only what you need to eat every day. If you eat too much or too little, there will be negative effects.",
        order: 1,
    },
    {
        name: "Brush, Floss, Physical Hygiene",
        completed: false,
        id: "e409699d-119e-4624-9e7d-e74b2659cf31",
        about: "Floss. Brush teeth twice a day. Shower daily and stay clean. Flossing is the hardest habit to pick up. I recommend using Listerine Reach flossers, and I regularly floss while going on a walk or some other routine task. Ask your dentist how to properly floss, and be honest with them - they're here to support you.",
        order: 2,
    },
    {
        name: "Exercise",
        completed: false,
        id: "ebe99dac-f8bb-4ca7-be7c-b0f961895ead",
        about: "Keep your heart rate within the 75%-85% zone for around 30 minutes, 6 days a week for best results. Exercising 5-7 days a week is recommended - take rest days as needed, listen to your body. It's important to take at least 1-2 rest days per week if you are doing the same exercise too many days in a row (such as running). Your heart rate must be elevated into a specific heart rate zone in order for your effort to qualify as 'Exercise'. These zones vary with age. Searching for 'heart rate zones' should yield the information you need.",
        order: 3,
    },
    {
        name: "Disconnect 30 minutes (walk)",
        completed: false,
        id: "79e2ba1d-734b-4530-aa86-2a20d4acb4c1",
        about: "Disconnect from everything for 30 minutes. This can be done by taking a walk, meditating, lying down, sitting on the patio, shower, etc. A walk is a great choice - you can multi-task by flossing and walking, or connecting with someone while walking together, for example. When we are learning or trying to focus intensely on a task, our brains are operating in a different mode than when we shower or go for a walk. Being bored and letting the mind wander is actually more beneficial than staying focused for hours straight, because the brain is switching to a mode where it processes ideas in the background. This is why we often come up with 'shower thoughts' and other ideas when doing unrelated things. Take advantage of this!",
        order: 4,
    },
    {
        name: "Hour of Focus",
        completed: false,
        id: "3629c196-3979-4de0-bff8-f778d98dafb7",
        about: "In order to be successful, you have to get things done. That's why this task exists. Every day you should make it a priority to focus on something for one hour straight. Your ability to focus is like a muscle; you may have to train into it. Success will come with focus.",
        order: 5,
    },
    {
        name: "Connect",
        completed: false,
        id: "601e3e1f-7c99-4ad6-9e2e-d2a0f4afd66c",
        about: "Talk to someone, even for a small amount of time, every day. Making an impact on another person's life will have a positive impact on your life too. We often underestimate how much others will appreciate a simple hello, even if they don't have time to respond to you amidst their busy lives. If you do not speak to anyone for a long period of time, you may unconsciously be a bit less happy without even realizing it. Seek to share experiences with others at your own pace.",
        order: 6,
    },
];