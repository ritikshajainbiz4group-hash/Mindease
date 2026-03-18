@echo off
set PGPASSWORD=1234
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE mindease;"
if %ERRORLEVEL% EQU 0 (
    echo Database 'mindease' created successfully!
) else (
    echo Database might already exist. Checking...
    "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -l | findstr mindease
)
set PGPASSWORD=
