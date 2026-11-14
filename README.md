# BVC Content Dashboard

Separate staff dashboard for adding and managing blogs, events, news (broadcasts) and insights on bvcglobal.com.
It is its own project: it is not part of the WordPress theme and has its own Git repository.

## What is in this folder

| Folder | What it is |
|---|---|
| `staff_login/`, `staff_login_mobile/` | Sign-in screen (desktop, phone) |
| `home_dashboard/`, `home_dashboard_mobile/` | Home with the four quick actions |
| `add_edit_content/`, `add_edit_content_mobile/` | Add or edit a blog, event, news item or insight |
| `manage_content/`, `manage_content_mobile/` | List, search, take offline, delete |
| `manage_photos/` | Photo library |
| `settings_admin/` | Settings and staff access |
| `chartered_editorial/DESIGN.md` | Colours, fonts and spacing (teal and gold, matched to bvcglobal.com) |
| `assets/bvc-logo.png` | The firm logo |

Status: screen designs only (HTML). The working app is built after the new bvcglobal.com site is live.

## Rules for this repository

- Only dashboard files go here. No WordPress theme files, no database or `.wpress` backups.
- Never commit passwords, keys or `.env` files. They live in the hosting provider's settings page.
- Planned address: a subdomain of bvcai.in (DNS is on Cloudflare).
