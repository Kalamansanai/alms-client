export type Template = {
    name: string;
    present: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type CompanyHierarchyNode = {
    id: number;
    name: string;
};

export type Site = CompanyHierarchyNode;
export type OPU = CompanyHierarchyNode;
export type Line = CompanyHierarchyNode;
export type Station = CompanyHierarchyNode & {
    locations: Array<Location>;
};

export type Location = CompanyHierarchyNode & {
    detector?: Detector;
    hasSnapshot: boolean;
    ongoingTask?: OngoingTask;
};

export const DetectorState = {
    Off: "Off",
    Standby: "Standby",
    Streaming: "Streaming",
    Monitoring: "Monitoring",
    Locating: "Locating",
} as const;

export type DetectorState = typeof DetectorState[keyof typeof DetectorState];

export const TaskType = {
    ToolKit: "ToolKit",
    ItemKit: "ItemKit",
    QA: "QA",
} as const;

export type TaskType = typeof TaskType[keyof typeof TaskType];

export const TaskInstanceState = {
    Completed: "Completed",
    Abandoned: "Abandoned",
    InProgress: "InProgress",
    Paused: "Paused",
} as const;

export type TaskInstanceState = typeof TaskInstanceState[keyof typeof TaskInstanceState];

export const ObjectState = {
    Present: "Present",
    Missing: "Missing",
    Uncertain: "Uncertain",
    UnknownObject: "UnknownObject",
} as const;

export type ObjectState = typeof ObjectState[keyof typeof ObjectState];

export type Detector = {
    id: number;
    name: string;
    macAddress: string;
    state: Array<DetectorState>;
};

export const parseDetectorState = (state: string): Array<DetectorState> => {
    const parsedState = state
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s in DetectorState)
        .map((s) => s as DetectorState);

    return parsedState;
};

export type Job = {
    id: number;
    name: string;
};

export type OngoingTask = {
    id: number;
    name: string;
    type: TaskType;
    job: Job;
    ongoingInstance?: OngoingTaskInstance;
    steps: Array<Step>;
    maxOrderNum: number;
};

export type OngoingTaskInstance = {
    id: number;
    state: TaskInstanceState;
    events: Array<Event>;
    currentOrderNum: number;
    currentOrderNumRemainingSteps: Array<Step>;
};

export type Event = {
    id: number;
    timestamp: Date;
    success: boolean;
    failureReason?: string;
    step: Step;
};

export type Step = {
    id: number;
    orderNum?: number;
    exInitState: ObjectState;
    exSubsState: ObjectState;
    object: Object;
};

export const GetStepActionString = (step: Step): string => {
    if (step.exInitState === ObjectState.Present && step.exSubsState === ObjectState.Missing) {
        return "remove";
    } else if (
        step.exInitState === ObjectState.Missing &&
        step.exSubsState === ObjectState.Present
    ) {
        return "replace";
    } else {
        return `${step.exInitState} -> ${step.exSubsState}`;
    }
};

export type Object = {
    id: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type Snapshot = {};
