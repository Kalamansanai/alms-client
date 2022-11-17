import { config as apiConfig } from "api";
import { OPUsApi } from "api_client/apis/OPUsApi";
import { SitesApi } from "api_client/apis/SitesApi";
import { CompanyHierarchyNode as CHNode, Site } from "types";

import { LinesApi, StationsApi } from "./api_client";

export type LevelDescriptor = {
    index: number;
    label: string;
    addFn: (name: string, parentId?: number) => Promise<CHNode>;
    getFn: (id?: number) => Promise<CHNode[]>;
    renameFn: (id: number, name: string) => Promise<void>;
    deleteFn: (id: number) => Promise<void>;
};

export const descriptors: LevelDescriptor[] = [
    {
        index: 0,
        label: "Sites",
        addFn: async (name) => {
            const site = await new SitesApi(apiConfig).apiEndpointsSitesCreate({
                sitesCreateReq: { name },
            });
            return { id: site.id!, name: site.name! };
        },
        getFn: async () => {
            const sites = await new SitesApi(apiConfig).apiEndpointsSitesList();
            return sites.map<Site>((s) => ({ id: s.id!, name: s.name! }));
        },
        renameFn: async (id, name) => {
            await new SitesApi(apiConfig).apiEndpointsSitesRename({ id, sitesRenameReq: { name } });
        },
        deleteFn: async (id) => {
            await new SitesApi(apiConfig).apiEndpointsSitesDelete({ id });
        },
    },
    {
        index: 1,
        label: "OPUs",
        addFn: async (name, parentId) => {
            const opu = await new OPUsApi(apiConfig).apiEndpointsOPUsCreate({
                oPUsCreateReq: { parentSiteId: parentId, name },
            });
            return { id: opu.id!, name: opu.name! };
        },
        getFn: async (id) => {
            const parentSite = await new SitesApi(apiConfig).apiEndpointsSitesGetById({
                id: id!,
            });
            return parentSite.opus!.map((o) => ({ id: o.id!, name: o.name! }));
        },
        renameFn: async (id, name) => {
            await new OPUsApi(apiConfig).apiEndpointsOPUsRename({ id, oPUsRenameReq: { name } });
        },
        deleteFn: async (id) => {
            await new OPUsApi(apiConfig).apiEndpointsOPUsDelete({ id });
        },
    },
    {
        index: 2,
        label: "Lines",
        addFn: async (name, parentId) => {
            const line = await new LinesApi(apiConfig).apiEndpointsLinesCreate({
                linesCreateReq: { opuId: parentId, name },
            });
            return { id: line.id!, name: line.name! };
        },
        getFn: async (id) => {
            const parentOpu = await new OPUsApi(apiConfig).apiEndpointsOPUsGetById({ id: id! });
            return parentOpu.lines!.map((l) => ({ id: l.id!, name: l.name! }));
        },
        renameFn: async (id, name) => {
            await new LinesApi(apiConfig).apiEndpointsLinesRename({ id, linesRenameReq: { name } });
        },
        deleteFn: async (id) => {
            await new LinesApi(apiConfig).apiEndpointsLinesDelete({ id });
        },
    },
    {
        index: 3,
        label: "Stations",
        addFn: async (name, parentId) => {
            const station = await new StationsApi(apiConfig).apiEndpointsStationsCreate({
                stationsCreateReq: { parentLineId: parentId, name },
            });
            return { id: station.id!, name: station.name! };
        },
        getFn: async (id) => {
            const parentLine = await new LinesApi(apiConfig).apiEndpointsLinesGetById({ id: id! });
            return parentLine.stations!.map((s) => ({ id: s.id!, name: s.name! }));
        },
        renameFn: async (id, name) => {
            await new StationsApi(apiConfig).apiEndpointsStationsRename({
                id,
                stationsRenameReq: { name },
            });
        },
        deleteFn: async (id) => {
            await new StationsApi(apiConfig).apiEndpointsStationsDelete({ id });
        },
    },
];

export type State = {
    items: Array<CHNode[]>;
    selectedIds: Array<number | null>;
    highestShownLevel: number;
    lastClickedId: number | null;
};

export const initialState: State = {
    items: Array(descriptors.length).fill([]),
    selectedIds: Array(descriptors.length).fill(null),
    highestShownLevel: 0,
    lastClickedId: null,
};

export type Action =
    | { type: "SetItems"; level: number; items: CHNode[] }
    | { type: "AddItem"; level: number; item: CHNode }
    | { type: "RenameItem"; level: number; id: number; name: string }
    | { type: "DeleteItem"; level: number; id: number }
    | { type: "SetSelectedId"; level: number; id: number | null }
    | { type: "Reset" };

export default function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SetItems": {
            const newState = { ...state };
            newState.items[action.level] = action.items;
            return newState;
        }
        case "AddItem": {
            const newState = { ...state };
            newState.items[action.level] = [...newState.items[action.level]!, action.item];
            return newState;
        }
        case "RenameItem": {
            const newItems = [...state.items[action.level]!];
            const renamedItem = newItems.find((i) => i.id === action.id)!;
            renamedItem.name = action.name;

            const newState = { ...state };
            newState.items[action.level] = newItems;
            return newState;
        }
        case "DeleteItem": {
            const newItems = [
                ...state.items[action.level]!.filter((item) => item.id !== action.id),
            ];
            const newState = { ...state };
            newState.items[action.level] = newItems;

            if (action.id === state.selectedIds[action.level]) {
                newState.highestShownLevel = action.level;
            }

            return newState;
        }
        case "SetSelectedId": {
            const sameIdSelected = state.selectedIds[action.level] === action.id;

            const newState = { ...state };
            if (action.id !== null) {
                newState.highestShownLevel = sameIdSelected
                    ? action.level
                    : Math.min(action.level + 1, descriptors.length);
            }
            newState.selectedIds[action.level] = sameIdSelected ? null : action.id;

            // console.log('================');
            // console.log(`${JSON.stringify(action)}`);
            // console.log(`${JSON.stringify(newState)}`);

            return newState;
        }
        case "Reset": {
            return initialState;
        }
        default:
            return state;
    }
}
