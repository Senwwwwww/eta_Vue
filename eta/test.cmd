@echo off
setlocal enabledelayedexpansion

:: 设置需要统计的文件扩展名（多个用空格分隔）
set EXTENSIONS=.js .ts .vue .html .css .java .py .cpp .h .c

set TOTAL=0

echo 正在统计代码行数...

for %%E in (%EXTENSIONS%) do (
    for /R %%F in (*%%E) do (
        for /f %%L in ('find /v /c "" ^< "%%F"') do (
            set /a TOTAL+=%%L
        )
    )
)

echo.
echo 代码总行数: %TOTAL%
endlocal
pause
