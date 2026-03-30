import { describe, expect, it } from "vitest";

import { applyActiveFilters, isRoomAvailable } from "../App";
import type { ActiveFilters } from "../RoomFilters";
import type { StudyRoom } from "../rooms";

const SAMPLE_ROOMS: StudyRoom[] = [
	{
		id: "lib-1",
		building: "Main Library",
		roomNumber: "101",
		capacity: 4,
		features: ["quiet"],
		floor: 1,
		isQuiet: true,
		hasWhiteboard: false,
		hasMonitor: false,
	},
	{
		id: "sci-1",
		building: "Science Center",
		roomNumber: "220",
		capacity: 10,
		features: ["group study"],
		floor: 2,
		isQuiet: false,
		hasWhiteboard: true,
		hasMonitor: true,
	},
	{
		id: "sci-2",
		building: "Science Center",
		roomNumber: "115",
		capacity: 2,
		features: ["whiteboard"],
		floor: 1,
		isQuiet: true,
		hasWhiteboard: true,
		hasMonitor: false,
	},
];

describe("applyActiveFilters", () => {
	it("filters by building", () => {
		const filters: ActiveFilters = {
			building: "Science Center",
			minCapacity: null,
			features: [],
		};

		const result = applyActiveFilters(SAMPLE_ROOMS, filters);
		expect(result).toHaveLength(2);
		expect(result.every((r) => r.building === "Science Center")).toBe(true);
	});

	it("filters by minimum capacity", () => {
		const filters: ActiveFilters = {
			building: null,
			minCapacity: 5,
			features: [],
		};

		const result = applyActiveFilters(SAMPLE_ROOMS, filters);
		expect(result).toHaveLength(1);
		expect(result[0].capacity).toBeGreaterThanOrEqual(5);
	});
});

describe("isRoomAvailable", () => {
	const room: StudyRoom = {
		id: "sci-test",
		building: "Science Center",
		roomNumber: "999",
		capacity: 6,
		features: [],
		floor: 1,
		isQuiet: false,
		hasWhiteboard: false,
		hasMonitor: false,
	};

	it("returns true for an early-morning time range (outside simulated busy hours)", () => {
		expect(isRoomAvailable(room, "2026-03-30", "06:00", "07:00")).toBe(true);
	});

	it("returns false for a wide time range that must overlap the room's simulated busy window", () => {
		expect(isRoomAvailable(room, "2026-03-30", "08:00", "19:00")).toBe(false);
	});

	it("returns false during the Science Center midday busy block", () => {
		expect(isRoomAvailable(room, "2026-03-30", "13:30", "14:00")).toBe(false);
	});
});
