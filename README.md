# Simulador de Escalonamento de Processos

Um simulador interativo de algoritmos de escalonamento de processos desenvolvido para a disciplina de Sistemas Operacionais da UFC.

## 🚀 Funcionalidades

- **Interface Web Moderna**: Frontend React com design responsivo e intuitivo
- **Múltiplos Algoritmos**: Suporte a 7 algoritmos de escalonamento diferentes
- **Visualização Interativa**: Diagramas de tempo em tempo real
- **Análise de Performance**: Métricas detalhadas de turnaround time, waiting time e trocas de contexto
- **Configuração Flexível**: Parâmetros personalizáveis para Round Robin e algoritmos com envelhecimento

## 📋 Algoritmos Suportados

1. **FCFS** - First-Come First-Served
2. **SJF** - Shortest Job First (Não-Preemptivo)
3. **SRTF** - Shortest Remaining Time First (Preemptivo)
4. **PriorityNP** - Priority Non-Preemptive
5. **PriorityP** - Priority Preemptive
6. **RoundRobin** - Round Robin com quantum configurável
7. **RoundRobinPriorityAging** - Round Robin com prioridade e envelhecimento

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework JavaScript
- **Lucide React** - Ícones modernos
- **CSS3** - Estilos responsivos e modernos

### Backend
- **Python 3** - Linguagem principal
- **Flask** - Framework web para API
- **Flask-CORS** - Suporte a CORS para comunicação frontend-backend

## 🚀 Deploy na Vercel

### Pré-requisitos para Deploy
- Conta na [Vercel](https://vercel.com)
- Projeto no GitHub

### Passos para Deploy

1. **Faça push do projeto para o GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Conecte o repositório na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - A Vercel detectará automaticamente as configurações

3. **Configurações automáticas**
   - O arquivo `vercel.json` já está configurado
   - O frontend React será buildado automaticamente
   - A API Python será deployada como serverless function

4. **Variáveis de ambiente (se necessário)**
   - Na dashboard da Vercel, vá em Settings > Environment Variables
   - Adicione variáveis se necessário

### Estrutura para Deploy
```
projetoSO/
├── api/
│   └── index.py          # Entry point para Vercel
├── scheduler-frontend/    # Frontend React
├── api_server.py          # Backend Python
├── vercel.json           # Configuração Vercel
├── requirements.txt      # Dependências Python
└── README.md
```

## 📦 Instalação e Execução

### Pré-requisitos
- Python 3.7+
- Node.js 16+
- npm ou yarn

### 1. Configuração do Backend (Python)

```bash
# Instalar dependências Python
pip install flask flask-cors

# Executar servidor da API
python api_server.py
```

O servidor estará disponível em `http://localhost:5000`

### 2. Configuração do Frontend (React)

```bash
# Navegar para o diretório do frontend
cd scheduler-frontend

# Instalar dependências
npm install

# Executar aplicação React
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 🎯 Como Usar

1. **Entrada de Processos**: 
   - Adicione processos com tempo de chegada, duração e prioridade
   - Use os botões "+" e "-" para gerenciar processos

2. **Seleção de Algoritmo**:
   - Escolha entre os 7 algoritmos disponíveis
   - Configure parâmetros específicos (quantum, aging) quando necessário

3. **Execução da Simulação**:
   - Clique em "Executar" para rodar a simulação
   - Aguarde o processamento dos resultados

4. **Visualização dos Resultados**:
   - Veja métricas de performance na aba "Resultados"
   - Analise o diagrama de tempo na aba "Diagrama"

## 📊 Interpretação dos Resultados

### Métricas Principais
- **Tempo Médio de Vida (Turnaround Time)**: Tempo total desde chegada até conclusão
- **Tempo Médio de Espera (Waiting Time)**: Tempo aguardando na fila de prontos
- **Trocas de Contexto**: Número de mudanças de processo na CPU

### Diagrama de Tempo
- **##**: Processo em execução
- **--**: Processo em espera
- **✓**: Processo concluído
- **Espaço em branco**: CPU ociosa ou processo não chegou

## 🔧 Configuração Avançada

### Arquivo config.txt
```txt
quantum: 2
aging: 1
```

### Parâmetros dos Algoritmos
- **Quantum**: Tamanho da fatia de tempo para Round Robin
- **Aging**: Taxa de aumento de prioridade para algoritmos com envelhecimento

## 📁 Estrutura do Projeto

```
projetoSO/
├── SchedulerNoGUI.py          # Código Python original
├── api_server.py              # Servidor Flask da API
├── config.txt                 # Configurações do sistema
├── scheduler-frontend/        # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── ProcessInput.js
│   │   │   ├── AlgorithmSelector.js
│   │   │   ├── ResultsDisplay.js
│   │   │   └── DiagramViewer.js
│   │   ├── App.js             # Componente principal
│   │   └── App.css            # Estilos CSS
│   └── package.json           # Dependências Node.js
└── README.md                  # Este arquivo
```

## 🐛 Solução de Problemas

### Erro de Conexão com API
- Verifique se o servidor Python está rodando na porta 5000
- Confirme se todas as dependências Python estão instaladas

### Problemas de CORS
- O Flask-CORS está configurado para permitir requisições do localhost:3000
- Se usar uma porta diferente, ajuste a configuração CORS no `api_server.py`

### Erro de Dependências Node.js
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Referências

- [Documentação React](https://react.dev/)
- [Documentação Flask](https://flask.palletsprojects.com/)
- [Algoritmos de Escalonamento - Tanenbaum](https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/5_CPU_Scheduling.html)

## 👥 Desenvolvido por

**Paulo Guilherme de Almeida Silva**  
**João Guilherme Lopes Batista de Oliveira**  
**Gabriel Pinheiro Muniz Cunha**  
**Gabriel da Silveira Miranda**

*Projeto desenvolvido para a disciplina de Sistemas Operacionais da Universidade Federal do Ceará (UFC).*

## 📄 Licença

Este projeto é destinado exclusivamente para fins educacionais e acadêmicos.
