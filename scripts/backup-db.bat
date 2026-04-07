@echo off
REM ── Nightly database backup for Master Tech ERP ──
REM Scheduled via Windows Task Scheduler at 2:00 AM Mountain Time

cd /d C:\Projects\mastertech-erp
node scripts\backup-db.js >> "%USERPROFILE%\OneDrive\MasterTech ERP Backups\backup.log" 2>&1
