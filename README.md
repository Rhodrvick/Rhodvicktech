# RHODVICK TECH website

A responsive static website for RHODVICK TECH.

## Project files

- `index.html` — page structure and content
- `styles.css` — colours, layout, responsive styling and animated logo effects
- `script.js` — small JavaScript enhancement (automatic copyright year)
- `assets/logo.jpg` — supplied RT logo

## Preview locally

Open `index.html` in a browser. Keep the `assets` folder beside the HTML file.

## Deploy with GitHub and Vercel

1. Create a new GitHub repository.
2. Upload all project files and the `assets` folder, keeping the same folder structure.
3. In Vercel, choose **Add New → Project** and import that GitHub repository.
4. For this static HTML site, leave the framework preset as **Other**. No build command is needed.
5. Set the output directory to `.` (the project root), then deploy.

The site uses relative file paths, so it can be hosted as a static site without a framework or package installation.

## Logo animation

The logo gently floats and gets a soft cyan glow on the main hero section. The smaller header logo has a subtle glow pulse. The animation respects the visitor's reduced-motion accessibility setting.
