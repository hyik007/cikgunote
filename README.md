# CikguNote

A calm, free, private notes & **RPH (Rancangan Pengajaran Harian)** workspace designed specifically for Malaysian teachers.

## Features
- **Exclusive Access Code Gate:** Share private invite codes (verified via SHA-256 hash) with your teachers or school staff, plus 1-click **Lock Desk** for shared school computers.
- **Bilingual (`EN` / `BM`):** Switch effortlessly between English and Bahasa Melayu.
- **Malaysian Teacher Folders & Templates:** Built-in 1-click templates for **RPH (KSSR / KSSM)**, **PBD Checklist (TP1–TP6)**, and **Minit Mesyuarat**.
- **Clean A4 Print / PDF:** Press **Print / PDF** to export neat A4 lesson plans without sidebars or clutter.
- **Read-Only Share Links:** Share a single lesson note via WhatsApp (`#share=...`) without exposing your private notebook.
- **100% Free & Offline-First:** Zero backend, zero subscriptions, zero tracking — notes save locally with 1-click JSON Backup & Restore.

## Managing Exclusive Access Codes
Access codes are stored as SHA-256 hashes in `VALID_CODE_HASHES` inside `app.js`.
To generate a new code hash:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('MY-SCHOOL-CODE').digest('hex'))"
```
Add the printed hash to `VALID_CODE_HASHES` in `app.js` and redeploy.

## License
MIT
