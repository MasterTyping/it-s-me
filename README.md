# it-s-me

Interactive robotics portfolio project built with Next.js and React Three Fiber.
This app visualizes a URDF robot manipulator, supports IK dragging, and lets you add scene objects to test collision feedback.

## Project Overview

This project is a 3D manipulator playground focused on:

- Loading and rendering a KUKA LWR URDF robot model
- Real-time inverse kinematics (IK) control in the viewport
- Joint inspection and manual joint slider controls
- Primitive object placement (box, sphere, cylinder)
- Collision-aware robot shader feedback (scanline hologram effect)

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei
- three-urdf-loader
- Tailwind CSS 4

## Getting Started

### 1) Requirements

- Node.js 20+
- npm (comes with Node.js)

### 2) Install dependencies

```bash
npm install
```

### 3) Start development server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production Run

Build and run in production mode:

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks

## Project Structure

```text
app/                  Next.js app router pages and layout
components/           3D scene, robot, and UI panel components
public/data/          URDF and mesh assets for robot/gripper models
shader/               Custom shader logic (scanline collision effect)
util/                 Utility helpers and loaders
```

## Notes

- Main robot URDF is loaded from `public/data/kuka_lwr/kuka.urdf`.
- The scene includes draggable/resizable info panels for robot state and object management.

## License

This repository is currently unlicensed unless otherwise specified in project files.
