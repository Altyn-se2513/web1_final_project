# Digital Book Collection — Final Project

Responsive multi-page website built with HTML5, CSS3, Bootstrap 5 and vanilla JavaScript.

## Pages (9)
- `index.html` — home + Google Books API recommendations
- `catalog.html` — search, genre filter, sort (state saved in localStorage)
- `book-details.html` — details, shelf button, related books
- `about.html` — about + expandable text
- `pricing.html` — monthly / yearly switch
- `contact.html` — validated contact form
- `account.html` — sign up / log in (localStorage simulation)
- `profile.html` — user details, reading goal, bookshelf
- `reader.html` — Gutendex public-domain reader

## Features
Light/dark theme (localStorage) · responsive layout · JS validation (no HTML validation attributes, `novalidate`) · animations · two public APIs with loading and error states.

## Run
Open `index.html` or use VS Code Live Server. Internet is needed for Bootstrap, fonts and APIs.

## Structure
```
index.html catalog.html book-details.html about.html pricing.html
contact.html account.html profile.html reader.html
css/style.css  js/script.js  images/
```


## Reader fallback (November 2026)
Gutendex search uses a timeout. When unavailable, the reader offers clearly labelled offline demonstration passages for a limited set of public-domain titles. These passages are original summaries for testing, NOT the original books. Full editions depend on the external text host and browser CORS rules. Test the live site after GitHub Pages deployment.
