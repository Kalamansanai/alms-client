import useResizeObserver from "@react-hook/resize-observer";
import { backend } from "api";
import { useEffect, useMemo, useRef, useState } from "react";
import { Detector, OngoingTask, Step } from "types";
import { Location } from "types";
import { drawObject } from "utils/canvas";

import { Box, useMediaQuery, useTheme } from "@mui/material";

type Props = {
    playing: boolean;
    location: Location;
    detector?: Detector;
    setStreamFps: React.Dispatch<React.SetStateAction<number>>;
    ongoingTask: OngoingTask | undefined;
};

export default function Stream({ playing, location, detector, setStreamFps, ongoingTask }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [ongoingTaskState, setOngoingTaskState] = useState(ongoingTask);

    useEffect(() => {
        setOngoingTaskState(ongoingTask);
    }, [ongoingTask]);

    const source =
        playing && detector && detector.id
            ? `${backend}/api/v1/detectors/${detector.id}/stream`
            : "https://via.placeholder.com/640x360";

    const requestRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = new Image();
        img.src = source;
        if (canvas != null) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
        }
        const draw = () => {
            if (canvas != null) {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);

                if (ongoingTask) {
                    //next step with green
                    ongoingTask.ongoingInstance?.currentOrderNumRemainingSteps.forEach((s) => {
                        ctx!.strokeStyle = "green";
                        ctx!.lineWidth = 5;
                        ctx!.strokeRect(
                            s.object.coordinates.x,
                            s.object.coordinates.y,
                            s.object.coordinates.width,
                            s.object.coordinates.height
                        );
                    });
                    //all objects with dashed
                    ongoingTask.steps.forEach((s) => {
                        ctx!.strokeStyle = "grey";
                        ctx!.lineWidth = 2;
                        ctx!.setLineDash([5, 10]);
                        ctx!.strokeRect(
                            s.object.coordinates.x,
                            s.object.coordinates.y,
                            s.object.coordinates.width,
                            s.object.coordinates.height
                        );
                    });
                }
                requestRef.current = requestAnimationFrame(draw);
            }
        };
        if (playing) {
            draw();
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [playing, ongoingTask]);

    useResizeObserver(containerRef, (_) => {
        adjustVideoSize();
    });

    useEffect(() => {
        adjustVideoSize();
    }, []);

    const adjustVideoSize = () => {
        const elem = containerRef.current;
        if (!elem) return;

        const newHeight = (elem.clientWidth * 9) / 16;

        elem.style.height = newHeight + "px";
    };

    return (
        <Box display="flex" alignItems="center" ref={containerRef} sx={{ bgcolor: "black" }}>
            {/* <Box
                component="img"
                height="100%"
                width="100%"
                sx={{ boxShadow: 3 }}
                src={source}
                onLoad={() => console.count("load")}
            /> */}
            <Box height="100%" width="100%" component="canvas" ref={canvasRef} />
        </Box>
    );
}
