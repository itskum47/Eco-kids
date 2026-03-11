import React from "react";
import CountUp from "react-countup";

export default function PointsCounter({ points }) {
    return (
        <CountUp
            end={points}
            duration={0.5}
        />
    );
}
