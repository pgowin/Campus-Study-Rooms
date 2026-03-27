import { useEffect, useMemo, useState } from "react";
import { RoomFilters } from "./RoomFilters";
import type { ActiveFilters } from "./RoomFilters";
import { STUDY_ROOMS, type StudyRoom } from "./rooms";

function toMinutes(time: string): number | null {
	// Expects "HH:MM" (24h). Returns minutes since midnight.
	const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	return hours * 60 + minutes;
}

function parseDayOfMonth(date: string): number | null {
	// Expects "YYYY-MM-DD".
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
	if (!match) return null;
	const day = Number(match[3]);
	return Number.isFinite(day) ? day : null;
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
	return startA < endB && startB < endA;
}

function hashString(input: string): number {
	// Small deterministic hash (non-cryptographic).
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
	}
	return hash;
}

export function isRoomAvailable(room: StudyRoom, date: string, startTime: string, endTime: string): boolean {
	const start = toMinutes(startTime);
	const end = toMinutes(endTime);
	const dayOfMonth = parseDayOfMonth(date);

	// If inputs are incomplete/invalid, treat room as available.
	if (start === null || end === null || dayOfMonth === null) return true;
	if (end <= start) return true;

	// Deterministic “busy window” rule (client-side simulation):
	// Each room gets a 60–90 minute busy window between 08:00–18:00 based on id + day.
	const seed = hashString(room.id + room.building) + dayOfMonth;
	const busyStartHour = 8 + (seed % 10); // 08:00–17:00
	const busyStart = busyStartHour * 60;
	const busyDuration = 60 + (seed % 2) * 30; // 60 or 90 minutes
	const busyEnd = busyStart + busyDuration;

	// Building pattern: Science Center is often busier midday.
	const buildingBusyStart = room.building === "Science Center" ? 13 * 60 : null;
	const buildingBusyEnd = room.building === "Science Center" ? 15 * 60 : null;

	const overlapsRoomBusy = rangesOverlap(start, end, busyStart, busyEnd);
	const overlapsBuildingBusy =
		buildingBusyStart !== null && buildingBusyEnd !== null
			? rangesOverlap(start, end, buildingBusyStart, buildingBusyEnd)
			: false;

	return !(overlapsRoomBusy || overlapsBuildingBusy);
}

function applyActiveFilters(rooms: StudyRoom[], filters: ActiveFilters): StudyRoom[] {
	return rooms.filter((room) => {
		if (filters.building && room.building !== filters.building) return false;
		if (filters.minCapacity !== null && room.capacity < filters.minCapacity) return false;

		for (const feature of filters.features) {
			if (feature === "Whiteboard" && !room.hasWhiteboard) return false;
			if (feature === "Monitor" && !room.hasMonitor) return false;
			if (feature === "Quiet" && !room.isQuiet) return false;
		}

		return true;
	});
}

function applyAvailabilityFilter(rooms: StudyRoom[], date: string, startTime: string, endTime: string): StudyRoom[] {
	return rooms.filter((room) => isRoomAvailable(room, date, startTime, endTime));
}

function computeVisibleRooms(
	allRooms: StudyRoom[],
	filters: ActiveFilters,
	date: string,
	startTime: string,
	endTime: string,
): StudyRoom[] {
	const afterFilters = applyActiveFilters(allRooms, filters);
	return applyAvailabilityFilter(afterFilters, date, startTime, endTime);
}

type RoomListItemProps = {
	id: string;
	building: string;
	roomNumber: string;
	capacity: number;
	features: string[];
};

function RoomListItem({ building, roomNumber, capacity, features }: RoomListItemProps) {
	const displayedFeatures = features.slice(0, 4);
	const hasMoreFeatures = features.length > displayedFeatures.length;

	return (
		<li
			style={{
				padding: "12px 0",
				borderBottom: "1px solid rgba(0,0,0,0.1)",
			}}
		>
			<div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
				<div>
					<div style={{ fontWeight: 600 }}>
						{building} — Room {roomNumber}
					</div>
					<div style={{ fontSize: 14, opacity: 0.85 }}>
						Capacity: {capacity}
					</div>
				</div>
			</div>
			<div style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}>
				Features: {displayedFeatures.join(", ")}
				{hasMoreFeatures ? " …" : ""}
			</div>
		</li>
	);
}

function App() {
	const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
	const [selectedDate, setSelectedDate] = useState(defaultDate);
	const [startTime, setStartTime] = useState("09:00");
	const [endTime, setEndTime] = useState("10:00");

	const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
		building: null,
		minCapacity: null,
		features: [],
	});
	const [filteredRooms, setFilteredRooms] = useState(() =>
		computeVisibleRooms(STUDY_ROOMS, { building: null, minCapacity: null, features: [] }, defaultDate, "09:00", "10:00"),
	);

	useEffect(() => {
		setFilteredRooms(computeVisibleRooms(STUDY_ROOMS, activeFilters, selectedDate, startTime, endTime));
	}, [activeFilters, selectedDate, startTime, endTime]);

	return (
		<div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
			<header style={{ padding: "8px 0 16px" }}>
				<h1 style={{ margin: 0 }}>Campus Study Room Finder</h1>
			</header>

			<main
				style={{
					display: "flex",
					gap: 16,
					alignItems: "flex-start",
					flexWrap: "wrap",
				}}
			>
				<aside
					style={{
						flex: "1 1 280px",
						border: "1px solid rgba(0,0,0,0.1)",
						borderRadius: 8,
						padding: 12,
					}}
				>
					<h2 style={{ marginTop: 0, fontSize: 18 }}>Filters</h2>
					<RoomFilters
						allRooms={STUDY_ROOMS}
						onFilterChange={(_nextFilteredRooms, nextActiveFilters) => {
							setActiveFilters(nextActiveFilters);
						}}
					/>
				</aside>

				<section
					style={{
						flex: "2 1 520px",
						border: "1px solid rgba(0,0,0,0.1)",
						borderRadius: 8,
						padding: 12,
					}}
				>
					<h2 style={{ marginTop: 0, fontSize: 18 }}>
						Rooms ({filteredRooms.length})
					</h2>
					<div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
						<div style={{ display: "grid", gap: 6 }}>
							<label style={{ fontWeight: 600, fontSize: 14 }} htmlFor="date">
								Date
							</label>
							<input
								id="date"
								type="date"
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								style={{ padding: 8 }}
							/>
						</div>
						<div style={{ display: "grid", gap: 6 }}>
							<label style={{ fontWeight: 600, fontSize: 14 }} htmlFor="startTime">
								Start time
							</label>
							<input
								id="startTime"
								type="time"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								style={{ padding: 8 }}
							/>
						</div>
						<div style={{ display: "grid", gap: 6 }}>
							<label style={{ fontWeight: 600, fontSize: 14 }} htmlFor="endTime">
								End time
							</label>
							<input
								id="endTime"
								type="time"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								style={{ padding: 8 }}
							/>
						</div>
					</div>
					<div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>
						Showing{activeFilters.building ? ` ${activeFilters.building}` : " all buildings"}
						{activeFilters.minCapacity !== null ? `, capacity ≥ ${activeFilters.minCapacity}` : ""}
						{activeFilters.features.length ? `, features: ${activeFilters.features.join(", ")}` : ""}
						{selectedDate ? `, ${selectedDate} ${startTime}–${endTime}` : ""}
					</div>
					<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
						{filteredRooms.map((room) => (
							<RoomListItem
								key={room.id}
								id={room.id}
								building={room.building}
								roomNumber={room.roomNumber}
								capacity={room.capacity}
								features={room.features}
							/>
						))}
					</ul>
				</section>
			</main>
		</div>
	);
}

export default App;
