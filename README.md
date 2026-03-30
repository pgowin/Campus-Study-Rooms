# Campus Study Room Finder

A lightweight web app that helps students discover campus study rooms, filter by what they need (building, capacity, features), and view simulated availability for a chosen date and time range.

This repository is designed to be both a useful demo app and a clean starting point for extending into a real scheduling/booking product.

## Project Overview

Campus Study Room Finder provides:

- A searchable/browsable list of study rooms across campus
- Client-side filtering (building, minimum capacity, and key features)
- A date + time range selector
- Simulated availability (no backend)
- A simple “request booking” flow that confirms the request (no persistence)

## Key Features

- **Room discovery**: browse a curated set of sample rooms.
- **Filters**: building, minimum capacity, and feature checkboxes (quiet, monitor, whiteboard).
- **Availability simulation**: deterministic, client-side “busy windows” based on room/date/time.
- **Room details modal**: click a room to open a modal with full details.
- **Booking request (simulation)**: requests show a confirmation with room + selected time range.

## Technology Stack

- **React** (UI)
- **TypeScript** (types and maintainability)
- **Vite** (development server + build tooling)

## Application Architecture

At a high level:

- `App` is the top-level page container. It owns:
  - filter state
  - selected date/time range
  - selected room
  - derived list of visible rooms
- `RoomFilters` emits an `ActiveFilters` object whenever a filter changes.
- Availability is computed via a helper `isRoomAvailable(...)` using deterministic rules.
- The room list displays the filtered + available rooms.
- `RoomDetails` renders a modal when a room is selected.

### Data Flow (simplified)

1. `STUDY_ROOMS` provides the static dataset.
2. The user changes filters and/or date/time.
3. `App` recomputes visible rooms using small helper functions:
   - filter by selected building/capacity/features
   - filter again by simulated availability
4. Clicking a room sets `selectedRoom` and opens the `RoomDetails` modal.
5. “Request booking” triggers a confirmation (front-end only).

## Install & Run Locally

Prerequisites:

- Node.js (recent LTS recommended)
- npm

Commands:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Folder Structure

```
campus-study-rooms/
  public/
  src/
    App.tsx            # Main layout + state + availability helpers
    App.css            # App-level styling
    RoomFilters.tsx    # Filters panel (building, min capacity, features)
    RoomDetails.tsx    # Accessible modal for room details + booking action
    rooms.ts           # StudyRoom type + sample dataset (STUDY_ROOMS)
    main.tsx
    index.css
  index.html
  package.json
  vite.config.ts
```

## How Availability Is Simulated

This project intentionally has **no backend**. Availability is simulated on the client using a deterministic rule implemented in `isRoomAvailable(room, date, startTime, endTime)`.

The current approach:

- Converts the selected time range into minutes.
- Derives a predictable “busy window” for each room based on room identity + day-of-month.
- Adds a simple building-level pattern (e.g., one building is busier around midday).
- A room is “available” if the selected range does not overlap any busy window.

This makes availability:

- **Repeatable** (same inputs → same result)
- **Fast** (pure client-side)
- **Easy to replace** with a real API later

## Roadmap / Future Enhancements

Potential next steps (intentionally not implemented yet):

- Persist booking requests (API + database)
- Real calendar-style availability (blocked slots, recurring events)
- More granular features (coffee proximity, outlets, accessibility, reservable-only, etc.)
- Search and sorting (by capacity, quietness, building)
- Better accessibility ergonomics (focus trapping in modal)
- UI polish and component extraction (design system or shared UI library)

## Contributing

Contributions are welcome.

- Keep changes focused and easy to review.
- Prefer small PRs with clear descriptions.
- Run `npm run build` before opening a PR.
- Follow existing code style (TypeScript + functional React components).

## License

TBD. Add your preferred license here (e.g., MIT, Apache-2.0, or internal proprietary notice).
