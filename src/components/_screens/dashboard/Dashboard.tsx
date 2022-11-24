import { config as apiConfig } from "api";
import { StationsApi } from "api_client";
import { Outlet, Params, useLoaderData } from "react-router-dom";

import { Box, useMediaQuery, useTheme } from "@mui/material";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Unstable_Grid2";

import { Station, parseDetectorState } from "../../../types";
import DashboardMain from "./DashboardMain";
import StationMenu from "./StationMenu";

export async function loader({ params }: { params: Params }) {
    const id = params["station_id"]! as any as number;
    // NOTE(rg): this is kind of a hack; These types mostly look the same, except for the
    // DetectorState
    let station = (await new StationsApi(apiConfig).apiEndpointsStationsGetById({ id })) as Station;

    station.locations.forEach((l) => {
        if (!l.detector) return;

        l.detector.state = parseDetectorState(l.detector.state as unknown as string);
    });

    return station;
}

export default function Dashboard() {
    // NOTE(rg): this is a hack.
    const station = useLoaderData() as Station;
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Grid container columnSpacing={2} rowSpacing={isSm ? 2 : 0} sx={{ height: "100%" }}>
            <Grid item xs={12} sm={12} md={3} sx={{ height: "100%" }}>
                <Paper square elevation={16} sx={{ height: "100%" }}>
                    <StationMenu station={station} />
                </Paper>
            </Grid>
            <Grid container item xs={12} sm={12} md={9} spacing={0}>
                <Outlet />
            </Grid>
        </Grid>
    );
}
