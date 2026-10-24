# Ota Škvor — UI/UX Designer Portfolio

This repository contains my personal UI/UX design portfolio, showcasing selected projects and case studies from the past few years of professional and freelance work.

The portfolio focuses on product design, UI/UX, design systems, and digital experiences across web, mobile, and enterprise software. Each case study provides an overview of the project context, design challenges, my role and approach, key decisions, and the resulting solution.

Alongside visual design, the portfolio reflects my interest in the connection between design and development — from reusable components and design systems to responsive implementation and interaction design.

## Portfolio

The live portfolio is available here:

**https://otaskvor-create.github.io/portfolio/**

The website is available in both **English and Czech**.

## About

I am a UI/UX Designer focused on creating clear, scalable, and user-centered digital products. My experience includes product design, enterprise software, design systems, responsive web design, mobile applications, prototyping, and close collaboration with development teams.

This portfolio represents a selection of work that best demonstrates my design process, problem-solving approach, and experience working on both complex product environments and smaller digital projects.

## Run locally

The site is plain HTML, CSS and JavaScript, so there is no build step.

```bash
npm install
npm start        # http://localhost:3000
```

`npm run dev` starts a live-reload server instead. Any other static server works too, for example `python3 -m http.server 3000`.

## Adaptive cursor

On desktop, the default mouse cursor is replaced by a small adaptive cursor, inspired by the [Motion cursor example](https://examples.motion.dev/react/cursor). It is a dependency-free implementation (`js/cursor.js` and `css/cursor.css`), because Motion+ Cursor is a paid package.

| Situation | Cursor |
| --- | --- |
| Empty space | Small dot that follows the pointer on a spring |
| Links and buttons | Grows into a ring |
| Text | Thin caret that matches the height of the text under the pointer |
| Image galleries and the comparison slider | Pill or circle with a plus or arrows icon |
| Disabled controls | Dimmed dot |
| Mouse button held down | Shrinks slightly |

It is designed to stay out of the way:

- Only active for a mouse or trackpad (`hover: hover` and `pointer: fine`), never on touch devices.
- Turned off completely when the visitor prefers reduced motion.
- The native cursor is hidden only once the custom one is on screen, and comes back when the pointer leaves the window.
- The cursor inverts what is below it (`mix-blend-mode: difference`), so it stays visible on the light background, on images and in the Seyfor theme previews.

Detection reads the `cursor:` values already written in `css/style.css`, so a new component with `cursor: pointer` gets the right behaviour without touching the script. To override it on a single element, set `data-cursor="pointer | text | drag | zoom | disabled | hide"`.
