@echo off
echo ========================================
echo  Simulador de Escalonamento de Processos
echo  UFC - Sistemas Operacionais
echo ========================================
echo.

echo Iniciando servidor Python (Backend)...
start "API Server" cmd /k "python api_server.py"

echo.
echo Aguardando 3 segundos para o servidor inicializar...
timeout /t 3 /nobreak > nul

echo.
echo Iniciando aplicacao React (Frontend)...
cd scheduler-frontend
start "React App" cmd /k "npm start"

echo.
echo ========================================
echo  Aplicacao iniciada com sucesso!
echo.
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo ========================================
echo.
echo Pressione qualquer tecla para fechar...
pause > nul
