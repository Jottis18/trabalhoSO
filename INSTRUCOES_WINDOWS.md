# Instruções de Execução - Windows

## 🚀 Execução Rápida

### Opção 1: Script Automático (Recomendado)
1. Execute o arquivo `start_app.bat` clicando duas vezes nele
2. Aguarde os servidores iniciarem
3. Acesse http://localhost:3000 no seu navegador

### Opção 2: Execução Manual

#### Terminal 1 - Backend Python:
```cmd
python api_server.py
```

#### Terminal 2 - Frontend React:
```cmd
cd scheduler-frontend
npm start
```

## 📋 Verificação de Funcionamento

1. **Backend**: Acesse http://localhost:5000/api/health
   - Deve retornar: `{"status": "healthy", "message": "API funcionando corretamente"}`

2. **Frontend**: Acesse http://localhost:3000
   - Deve carregar a interface do simulador

## 🔧 Solução de Problemas

### Erro: "python não é reconhecido"
- Instale Python 3.7+ do site oficial
- Adicione Python ao PATH do sistema

### Erro: "npm não é reconhecido"
- Instale Node.js do site oficial
- Reinicie o terminal após instalação

### Erro de Porta em Uso
- Feche outros programas usando as portas 3000 ou 5000
- Ou altere as portas nos arquivos de configuração

### Problemas de Dependências
```cmd
# Reinstalar dependências Python
pip install --upgrade flask flask-cors

# Reinstalar dependências Node.js
cd scheduler-frontend
npm cache clean --force
del package-lock.json
npm install
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se Python e Node.js estão instalados
2. Confirme se as portas 3000 e 5000 estão livres
3. Execute os comandos de verificação acima
4. Consulte o README.md para mais detalhes
