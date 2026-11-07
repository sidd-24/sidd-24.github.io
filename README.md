# sidd-24.github.io

My portfolio site: plain HTML, CSS and JavaScript, with no build step.

- **Role views.** `?for=ai`, `?for=de`, `?for=ml`, `?for=bi`, `?for=pm` or `?for=qa` change the headline, the project order and the skills. Send the matching link with each application.
- **Live numbers.** The page reads `results/summary.json` from [dax-risk-monitor](https://github.com/sidd-24/dax-risk-monitor), [db-delay-tracker](https://github.com/sidd-24/db-delay-tracker) and [job-skill-tracker](https://github.com/sidd-24/job-skill-tracker), which GitHub Actions refresh weekly, monthly and daily. If GitHub can't be reached, it falls back to the values in `js/data.js`.
- **Content.** Projects, skills and experience are all in [`js/data.js`](js/data.js).

## Hosting on GitHub Pages

1. Create a public repository named exactly `sidd-24.github.io`.
2. Push this folder to its `main` branch.
3. Go to **Settings → Pages → Build and deployment** and choose **Deploy from a branch**, `main`, `/ (root)`.

The site is then at https://sidd-24.github.io.

## Running it locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.
