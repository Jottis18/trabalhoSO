#!/bin/bash

echo "========================================"
echo " Simulador de Escalonamento de Processos"
echo " UFC - Sistemas Operacionais"
echo "========================================"
echo

echo "Iniciando servidor Python (Backend)..."
python3 api_server.py &
BACKEND_PID=$!

echo
echo "Aguardando 3 segundos para o servidor inicializar..."
sleep 3

echo
echo "Iniciando aplicação React (Frontend)..."
cd scheduler-frontend
npm start &
FRONTEND_PID=$!

echo
echo "========================================"
echo " Aplicação iniciada com sucesso!"
echo
echo " Frontend: http://localhost:3000"
echo " Backend:  http://localhost:5001"
echo "========================================"
echo
echo "Pressione Ctrl+C para parar ambos os servidores..."

# Função para limpar processos ao sair
cleanup() {
    echo
    echo "Parando servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar sinal de interrupção
trap cleanup SIGINT

# Aguardar indefinidamente
wait
