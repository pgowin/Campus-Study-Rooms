import { useEffect, useMemo, useState } from "react";
import type { StudyRoom } from "./rooms";

export type ActiveFilters = {
	building: string | null;
	minCapacity: number | null;
	features: string[];
};

type RoomFiltersProps = {
	allRooms: StudyRoom[];
	onFilterChange: (filteredRooms: StudyRoom[], activeFilters: ActiveFilters) => void;
};

const FEATURE_OPTIONS = ["Whiteboard", "Monitor", "Quiet"] as const;

type FeatureOption = (typeof FEATURE_OPTIONS)[number];

function applyFilters(allRooms: StudyRoom[], filters: ActiveFilters): StudyRoom[] {
	return allRooms.filter((room) => {
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

export function RoomFilters({ allRooms, onFilterChange }: RoomFiltersProps) {
	const buildingOptions = useMemo(() => {
		const buildings = new Set<string>();
		for (const room of allRooms) buildings.add(room.building);
		return Array.from(buildings).sort((a, b) => a.localeCompare(b));
	}, [allRooms]);

	const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
		building: null,
		minCapacity: null,
		features: [],
	});

	useEffect(() => {
		const filteredRooms = applyFilters(allRooms, activeFilters);
		onFilterChange(filteredRooms, activeFilters);
	}, [allRooms, activeFilters, onFilterChange]);

	function updateBuilding(nextBuilding: string) {
		setActiveFilters((prev) => ({
			...prev,
			building: nextBuilding === "" ? null : nextBuilding,
		}));
	}

	function updateMinCapacity(rawValue: string) {
		const trimmed = rawValue.trim();
		if (trimmed === "") {
			setActiveFilters((prev) => ({ ...prev, minCapacity: null }));
			return;
		}

		const parsed = Number(trimmed);
		setActiveFilters((prev) => ({
			...prev,
			minCapacity: Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : prev.minCapacity,
		}));
	}

	function toggleFeature(feature: FeatureOption, checked: boolean) {
		setActiveFilters((prev) => {
			const set = new Set(prev.features);
			if (checked) set.add(feature);
			else set.delete(feature);
			return { ...prev, features: Array.from(set) };
		});
	}

	return (
		<div style={{ display: "grid", gap: 12 }}>
			<div style={{ display: "grid", gap: 6 }}>
				<label style={{ fontWeight: 600 }} htmlFor="building-filter">
					Building
				</label>
				<select
					id="building-filter"
					value={activeFilters.building ?? ""}
					onChange={(e) => updateBuilding(e.target.value)}
					style={{ padding: 8 }}
				>
					<option value="">All buildings</option>
					{buildingOptions.map((building) => (
						<option key={building} value={building}>
							{building}
						</option>
					))}
				</select>
			</div>

			<div style={{ display: "grid", gap: 6 }}>
				<label style={{ fontWeight: 600 }} htmlFor="capacity-filter">
					Minimum capacity
				</label>
				<input
					id="capacity-filter"
					type="number"
					inputMode="numeric"
					min={0}
					placeholder="Any"
					value={activeFilters.minCapacity ?? ""}
					onChange={(e) => updateMinCapacity(e.target.value)}
					style={{ padding: 8 }}
				/>
			</div>

			<fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 6 }}>
				<legend style={{ fontWeight: 600 }}>Features</legend>
				<div style={{ display: "grid", gap: 6 }}>
					{FEATURE_OPTIONS.map((feature) => {
						const id = `feature-${feature.toLowerCase()}`;
						const checked = activeFilters.features.includes(feature);

						return (
							<label key={feature} htmlFor={id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
								<input
									id={id}
									type="checkbox"
									checked={checked}
									onChange={(e) => toggleFeature(feature, e.target.checked)}
								/>
								<span>{feature}</span>
							</label>
						);
					})}
				</div>
			</fieldset>
		</div>
	);
}
