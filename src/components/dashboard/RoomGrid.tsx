"use client";

import { Fragment } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoomCard from "./RoomCard";
import { type RoomOccupancy } from "@/hooks/useDashboard";

interface RoomGridProps {
    roomsWithOccupancy: RoomOccupancy[];
    onRoomClick: (room: any, tenant?: any, rental?: any) => void;
}

// Pair rooms by sorted index: [0]→left, [1]→right, [2]→left, ...
function pairRooms(sortedRooms: RoomOccupancy[]): Array<[RoomOccupancy, RoomOccupancy | null]> {
    const pairs: Array<[RoomOccupancy, RoomOccupancy | null]> = [];
    for (let pairIndex = 0; pairIndex < sortedRooms.length; pairIndex += 2) {
        pairs.push([sortedRooms[pairIndex], sortedRooms[pairIndex + 1] ?? null]);
    }
    return pairs;
}

// Subtle per-floor background tints — cycles if more than 4 floors
const FLOOR_BG_CLASSES = ["bg-purple-100/50 border-purple-200/60", "bg-sky-100/50 border-sky-200/60", "bg-rose-100/50 border-rose-200/60", "bg-emerald-100/50 border-emerald-200/60"];

function RoomNumber({ number, align }: { number: string | number; align: "left" | "right" }) {
    return (
        <div className={`flex items-center ${align === "left" ? "justify-end" : "justify-start"}`}>
            <span className="text-[11px] font-black text-foreground/40 tabular-nums select-none">{number}</span>
        </div>
    );
}

function FloorSection({ floor, floorIndex, roomsWithOccupancy, onRoomClick, tabId }: { floor: string; floorIndex: number; roomsWithOccupancy: RoomOccupancy[]; onRoomClick: (room: any, tenant?: any, rental?: any) => void; tabId: string }) {
    const sortedRooms = [...roomsWithOccupancy].sort((roomA, roomB) => Number(roomA.room.No_Kamar) - Number(roomB.room.No_Kamar));
    const pairs = pairRooms(sortedRooms).reverse(); // bottom-up

    const bgClass = FLOOR_BG_CLASSES[floorIndex % FLOOR_BG_CLASSES.length];

    return (
        <div className={`rounded-3xl border p-4 ${bgClass}`}>
            {/*
        CSS grid: [num-left] [card-left] [center-floor] [card-right] [num-right]
        Center column spans ALL rows via gridRow
      */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2rem 1fr 3rem 1fr 2rem",
                    gridTemplateRows: `repeat(${pairs.length}, auto)`,
                    gap: "8px",
                }}
            >
                {/* Vertical floor label — spans all rows */}
                <div
                    style={{
                        gridColumn: 3,
                        gridRow: `1 / ${pairs.length + 1}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <span
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                        className="font-black uppercase tracking-[0.3em] text-xs text-foreground/25 select-none whitespace-nowrap"
                    >
                        Lantai {floor}
                    </span>
                </div>

                {/* Room pair rows */}
                {pairs.map(([leftOccupancy, rightOccupancy], pairRowIndex) => (
                    <Fragment key={`${tabId}-pair-${pairRowIndex}`}>
                        {/* Left room number */}
                        <div
                            style={{ gridColumn: 1, gridRow: pairRowIndex + 1 }}
                            className="flex items-center justify-center"
                        >
                            <RoomNumber
                                number={leftOccupancy.room.No_Kamar}
                                align="right"
                            />
                        </div>

                        {/* Left card */}
                        <div style={{ gridColumn: 2, gridRow: pairRowIndex + 1 }}>
                            <RoomCard
                                room={leftOccupancy.room}
                                tenant={leftOccupancy.activeTenant}
                                rental={leftOccupancy.activeRental}
                                nextRental={leftOccupancy.nextRental}
                                nextTenant={leftOccupancy.nextTenant}
                                upcomingCount={leftOccupancy.upcomingCount}
                                onClick={onRoomClick}
                                compact
                            />
                        </div>

                        {/* Right card */}
                        <div style={{ gridColumn: 4, gridRow: pairRowIndex + 1 }}>
                            {rightOccupancy ? (
                                <RoomCard
                                    room={rightOccupancy.room}
                                    tenant={rightOccupancy.activeTenant}
                                    rental={rightOccupancy.activeRental}
                                    nextRental={rightOccupancy.nextRental}
                                    nextTenant={rightOccupancy.nextTenant}
                                    upcomingCount={rightOccupancy.upcomingCount}
                                    onClick={onRoomClick}
                                    compact
                                />
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/60 min-h-[80px] bg-white/30" />
                            )}
                        </div>

                        {/* Right room number */}
                        <div
                            style={{ gridColumn: 5, gridRow: pairRowIndex + 1 }}
                            className="flex items-center justify-center"
                        >
                            {rightOccupancy && (
                                <RoomNumber
                                    number={rightOccupancy.room.No_Kamar}
                                    align="left"
                                />
                            )}
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

export default function RoomGrid({ roomsWithOccupancy, onRoomClick }: RoomGridProps) {
    const floors = Array.from(new Set(roomsWithOccupancy.map((entry) => String(entry.room.Lantai)))).sort();

    return (
        <Tabs
            defaultValue="ALL"
            className="w-full space-y-8"
        >
            {/* Floor tabs + legend */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="overflow-x-auto pb-1">
                    <TabsList className="bg-muted/50 border border-border p-1 rounded-2xl h-auto">
                        <TabsTrigger
                            value="ALL"
                            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Semua Lantai
                        </TabsTrigger>
                        {floors.map((floor) => (
                            <TabsTrigger
                                key={floor}
                                value={floor}
                                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                Lantai {floor}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-white border border-border rounded-2xl shadow-soft text-[10px] font-bold uppercase tracking-widest">
                    {[
                        { color: "bg-emerald-500", label: "Aktif" },
                        { color: "bg-amber-500", label: "Booking" },
                        { color: "bg-rose-500 animate-pulse", label: "Tempo" },
                        { color: "bg-slate-200", label: "Kosong" },
                    ].map(({ color, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 text-muted-foreground"
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* All floors tab */}
            <TabsContent
                value="ALL"
                className="space-y-6"
            >
                {floors.map((floor, floorIndex) => {
                    const floorRooms = roomsWithOccupancy.filter((entry) => String(entry.room.Lantai) === floor);
                    if (floorRooms.length === 0) return null;
                    return (
                        <FloorSection
                            key={`all-${floor}`}
                            floor={floor}
                            floorIndex={floorIndex}
                            roomsWithOccupancy={floorRooms}
                            onRoomClick={onRoomClick}
                            tabId={`all-${floor}`}
                        />
                    );
                })}
            </TabsContent>

            {/* Per-floor tabs */}
            {floors.map((floor, floorIndex) => (
                <TabsContent
                    key={floor}
                    value={floor}
                >
                    <FloorSection
                        floor={floor}
                        floorIndex={floorIndex}
                        roomsWithOccupancy={roomsWithOccupancy.filter((entry) => String(entry.room.Lantai) === floor)}
                        onRoomClick={onRoomClick}
                        tabId={`tab-${floor}`}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}
