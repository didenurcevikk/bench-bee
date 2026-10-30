# Bench Bee

A Western blot troubleshooting app for people at the bench. Pick the blot pictures that look like yours, answer a few quick questions, and get the likely causes ranked, each with the first thing to check and how to fix it.

It works on phones and laptops, can be added to a phone's home screen like a normal app, and keeps working without internet once it has been opened.

You can also take or choose a photo of your blot. The app measures it in the browser (saturation colour, background level, evenness, how strong the signal is, small specks) and suggests which example pictures match. The photo is never uploaded.

You can save a troubleshoot with a name and a note, and reopen it later from Saved troubleshoots. Saved items stay in the browser on that device; nothing is sent anywhere.

## What's in the folder

| File | What it does |
|---|---|
| `index.html` | The page itself: header, the grid of blot pictures, the question and results area. |
| `styles.css` | Colours, fonts and layout, including dark mode and phone layout. |
| `app.js` | Draws the example blots, ranks the causes from your answers, and builds the page. |
| `photo.js` | The photo check: crop box and the pixel measurements that suggest matching pictures. |
| `data/western-blot.js` | All the Western blot content: causes (`C`), questions (`Q`) and symptoms (`SYMPTOMS`). Edit this to change or add problems. |
| `manifest.webmanifest` | Tells phones the app's name, icon and colours, so it can be installed. |
| `sw.js` | The service worker. It saves the app's files so it opens offline. |
| `icons/` | App icons and favicon (the bee in the honeycomb). |

## How the ranking works

Each symptom lists possible causes with a starting score. Each answer adds to or takes away from some causes. When several symptoms are picked, their scores add up, so a cause that explains more than one problem rises to the top. The scores are a rough guide, not probabilities.

## Adding a new problem

1. Add any new causes to `C` in `data/western-blot.js` (title, why, check first, fixes).
2. Add its questions to `Q`. Each answer has an `e` object saying which causes it pushes up or down.
3. Add a symptom to `SYMPTOMS` with its causes, starting scores and question ids.
4. If you want a new example picture, add a case for it in the `blot()` function in `app.js`.
5. Bump `VERSION` in `sw.js` so installed copies update.

## Running it on your computer

From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works, but offline mode only turns on when the app is served over http.

## Sources

The problem list was built from vendor troubleshooting guides by Thermo Fisher, Bio-Rad, LI-COR, Abcam and Proteintech. Links are in the app's footer. This is general guidance; always check your antibody datasheet and your lab's protocols.
