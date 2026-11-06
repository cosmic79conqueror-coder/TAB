# Neural Workspace Browser (Cyber Edition)

A high-tech, browser-in-a-browser workspace built with vanilla web technologies. It features a stunning animated cyber-glass aesthetic, local data persistence, and a live global news feed.

## ✨ Features

* **Cyber-Glass UI:** An animated, multi-color gradient background with a high-tech grid overlay, frosted glass panels, and interactive neon accents (Cyan & Pink).
* **Live Global News Feed:** Fetches real-time news from Google News RSS feeds using the `rss2json` API. Links open securely in a new tab to bypass iframe reCAPTCHA blocks.
* **Local Persistence Engine:** Utilizes `localStorage` to save user bookmarks, session telemetry (history), and operator authentication details directly in the browser.
* **Iframe Sandbox Navigation:** Built-in web navigation defaulting to DuckDuckGo (to ensure smooth iframe rendering without strict X-Frame-Options blocking).
* **Floating Media Dock:** An integrated, collapsible Spotify widget for uninterrupted audio playback during deep work sessions.
* **System Auth Modal:** A personalized authentication layer to decrypt the local workspace session.

## 🛠️ Tech Stack

* **HTML5:** Semantic structure and advanced iframe sandboxing.
* **CSS3:** CSS variables, `@keyframes` animations, backdrop-filters (glassmorphism), and custom scrollbars.
* **Vanilla JavaScript:** DOM manipulation, local storage management, array mapping, and asynchronous API data fetching (`async/await`).

## 🚀 Getting Started

No build tools, package managers, or backend required. This project runs entirely in the browser.