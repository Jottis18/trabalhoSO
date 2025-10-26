# SchedulerAI PRO - Deploy na Vercel

Este projeto é um simulador de algoritmos de escalonamento de processos desenvolvido para a disciplina de Sistemas Operacionais da UFC.

## 🚀 Deploy na Vercel

### Pré-requisitos
- Conta na Vercel
- Node.js instalado localmente (para testes)

### Como fazer o deploy

1. **Fazer push do código para o GitHub**
   ```bash
   git add .
   git commit -m "Preparado para deploy na Vercel"
   git push origin main
   ```

2. **Conectar com a Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub
   - Clique em "New Project"
   - Selecione o repositório do projeto
   - A Vercel detectará automaticamente que é um projeto React

3. **Configurações do Deploy**
   - **Framework Preset**: Create React App
   - **Root Directory**: `/` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o processo de build
   - Sua aplicação estará disponível em uma URL da Vercel

### ⚡ Funcionalidades

- **Simulação Local**: O projeto funciona completamente no frontend usando JavaScript
- **Algoritmos Suportados**:
  - FCFS (First-Come First-Served)
  - SJF (Shortest Job First)
  - SRTF (Shortest Remaining Time First)
  - Priority (Non-Preemptive e Preemptive)
  - Round Robin
  - Round Robin com Prioridade e Envelhecimento

- **Interface Moderna**: UI responsiva com React e Lucide Icons
- **Visualização de Diagramas**: Timeline visual dos processos
- **Métricas Detalhadas**: Tempo de retorno, tempo de espera e trocas de contexto

### 🔧 Configurações Técnicas

- **Frontend**: React 19.2.0
- **Build Tool**: Create React App
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: CSS Modules

### 📁 Estrutura do Projeto

```
/
├── src/
│   ├── components/          # Componentes React
│   ├── utils/              # Utilitários (simulador)
│   └── App.js              # Componente principal
├── public/                 # Arquivos estáticos
├── package.json            # Dependências Node.js
├── vercel.json             # Configuração Vercel
└── README.md               # Este arquivo
```

### 🐛 Solução de Problemas

**Build falha na Vercel:**
- Verifique se todas as dependências estão no `package.json`
- Execute `npm run build` localmente para testar
- Verifique os logs de build na Vercel

**Aplicação não carrega:**
- Verifique se o `vercel.json` está correto
- Confirme que o build foi bem-sucedido
- Teste localmente com `npm start`

**Simulação não funciona:**
- O simulador funciona completamente no frontend
- Não é necessário backend Python na Vercel
- Verifique o console do navegador para erros

### 🌐 URLs Importantes

- **Deploy**: Sua URL da Vercel será algo como `https://seu-projeto.vercel.app`
- **GitHub**: Link do seu repositório
- **Local**: `http://localhost:3000` (desenvolvimento)

### 📝 Notas Importantes

- O projeto foi adaptado para funcionar sem backend Python na Vercel
- Todas as simulações são executadas no frontend usando JavaScript
- O código Python foi mantido para referência, mas não é usado no deploy
- A aplicação é totalmente responsiva e funciona em dispositivos móveis

### 👥 Desenvolvedores

- Paulo Guilherme de Almeida Silva
- João Guilherme Lopes Batista de Oliveira  
- Gabriel Pinheiro Muniz Cunha
- Gabriel da Silveira Miranda

---

**Disciplina**: Sistemas Operacionais - UFC  
**Ano**: 2025
