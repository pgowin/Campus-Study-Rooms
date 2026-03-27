import { useState } from "react";
import { RoomFilters } from "./RoomFilters";
import type { ActiveFilters } from "./RoomFilters";
import { STUDY_ROOMS } from "./rooms";

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
	const [filteredRooms, setFilteredRooms] = useState(STUDY_ROOMS);
	const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
		building: null,
		minCapacity: null,
		features: [],
	});

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
						onFilterChange={(nextFilteredRooms, nextActiveFilters) => {
							setFilteredRooms(nextFilteredRooms);
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
					<div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>
						Showing{activeFilters.building ? ` ${activeFilters.building}` : " all buildings"}
						{activeFilters.minCapacity !== null ? `, capacity ≥ ${activeFilters.minCapacity}` : ""}
						{activeFilters.features.length ? `, features: ${activeFilters.features.join(", ")}` : ""}
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
