import React from "react";
import { FixedSizeList } from "react-window";
import { useLeaderboard } from "../../hooks/useLeaderboard";

export default function LeaderboardList() {
    const { data: leaderboardRes } = useLeaderboard();
    const data = leaderboardRes?.leaderboard || [];

    return (
        <FixedSizeList
            height={500}
            width="100%"
            itemSize={60}
            itemCount={data.length || 0}
        >
            {({ index, style }) => (
                <div style={style}>
                    {data[index]?.name || `User ${index}`}
                </div>
            )}
        </FixedSizeList>
    );
}
