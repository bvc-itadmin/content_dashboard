# BVC Content Dashboard

Separate staff dashboard for adding and managing blogs, events, news (broadcasts) and insights on bvcglobal.com.
It is its own project: it is not part of the WordPress theme and has its own Git repository.

## What is in this folder

| Folder | What it is |
|---|---|
| `index.html` | The front page: one sign-in for everyone |
| `home_dashboard/`, `home_dashboard_mobile/` | Home with the four quick actions |
| `add_edit_content/`, `add_edit_content_mobile/` | Add or edit a blog, event, news item or insight |
| `manage_content/`, `manage_content_mobile/` | List, search, take offline, delete |
| `manage_photos/` | Photo library |
| `settings_admin/` | Profile and logins (admin only) |

## How access works

- One sign-in page for everyone. There are no "staff" or "admin" sign-in pages.
- What a person sees depends on their login. Everyone sees Home, Add Content, Manage Content and Manage Photos.
- Only an admin also sees **Profile**, where logins are added, changed or removed (marked `data-admin-only` in the designs).
| `chartered_editorial/DESIGN.md` | Colours, fonts and spacing (teal and gold, matched to bvcglobal.com) |
| `assets/bvc-logo.png` | The firm logo |

Status: sign-in, roles and the connection to the website work (tested against the Local site). The screens still show sample content; they are being connected one by one.

## Run it on your computer

1. Copy `.env.example` to `.env.local` and fill in `WP_URL`, `SESSION_SECRET` and `DASHBOARD_API_KEY`.
2. `node dev-server.js`, then open http://localhost:3000
3. The website (WP_URL) must have the BVC theme with the dashboard API and the same key in `wp-config.php` as `BVC_DASHBOARD_API_KEY`.

For the live address the same three names go in Vercel under Settings > Environment Variables.

Server code: `api/` (one file per route) and `lib/` (sign-in cookie, website connection). `assets/app.js` and `assets/login.js` run in the browser.

Status of the original design note: the HTML screens came from Google Stitch. The working app is built after the new bvcglobal.com site is live.

## Rules for this repository

- Only dashboard files go here. No WordPress theme files, no database or `.wpress` backups.
- Never commit passwords, keys or `.env` files. They live in the hosting provider's settings page.
- Planned address: a subdomain of bvcai.in (DNS is on Cloudflare).
