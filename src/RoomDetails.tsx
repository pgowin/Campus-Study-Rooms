import { useEffect, useId, useRef } from "react";
import type { StudyRoom } from "./rooms";

type RoomDetailsProps = {
	room: StudyRoom | null;
	onClose: () => void;
	onRequestBooking: (room: StudyRoom) => void;
};

function YesNo({ value }: { value: boolean }) {
	return <span>{value ? "Yes" : "No"}</span>;
}

export function RoomDetails({ room, onClose, onRequestBooking }: RoomDetailsProps) {
	const titleId = useId();
	const descriptionId = useId();
	const closeButtonRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		if (!room) return;
		closeButtonRef.current?.focus();
	}, [room]);

	useEffect(() => {
		if (!room) return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [room, onClose]);

	if (!room) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.45)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 16,
				zIndex: 1000,
			}}
		>
			<div
				style={{
					width: "min(720px, 100%)",
					background: "white",
					color: "#111",
					borderRadius: 10,
					padding: 16,
					boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
					<div>
						<h2 id={titleId} style={{ margin: 0 }}>
							{room.building} — Room {room.roomNumber}
						</h2>
						<div id={descriptionId} style={{ marginTop: 6, opacity: 0.85 }}>
							Capacity {room.capacity} • Floor {room.floor}
						</div>
					</div>
					<button
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						style={{
							padding: "8px 12px",
							borderRadius: 8,
							border: "1px solid rgba(0,0,0,0.2)",
							background: "transparent",
							cursor: "pointer",
						}}
					>
						Close
					</button>
				</div>

				<hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,0.12)", margin: "12px 0" }} />

				<div style={{ display: "grid", gap: 12 }}>
					<section aria-label="Room details">
						<div style={{ display: "grid", gap: 6 }}>
							<div>
								<strong>Quiet:</strong> <YesNo value={room.isQuiet} />
							</div>
							<div>
								<strong>Whiteboard:</strong> <YesNo value={room.hasWhiteboard} />
							</div>
							<div>
								<strong>Monitor:</strong> <YesNo value={room.hasMonitor} />
							</div>
						</div>
					</section>

					<section aria-label="Features">
						<h3 style={{ margin: 0, fontSize: 16 }}>Features</h3>
						{room.features.length ? (
							<ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
								{room.features.map((feature) => (
									<li key={feature}>{feature}</li>
								))}
							</ul>
						) : (
							<p style={{ margin: "8px 0 0", opacity: 0.85 }}>No features listed.</p>
						)}
					</section>
				</div>

				<div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
					<button
						type="button"
						onClick={() => onRequestBooking(room)}
						style={{
							padding: "10px 14px",
							borderRadius: 8,
							border: "1px solid rgba(0,0,0,0.2)",
							background: "#111",
							color: "white",
							cursor: "pointer",
						}}
					>
						Request booking
					</button>
				</div>
			</div>
		</div>
	);
}
