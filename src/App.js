import React, { useState } from 'react';
import ProcessInput from './components/ProcessInput';
import AlgorithmSelector from './components/AlgorithmSelector';
import ResultsDisplay from './components/ResultsDisplay';
import DiagramViewer from './components/DiagramViewer';
import { Cpu, BarChart3, Clock, Settings } from 'lucide-react';
import './App.css';

function App() {
  const [processes, setProcesses] = useState([
    { id: 1, creationTime: 0, duration: 3, priority: 1 }
  ]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('FCFS');
  const [config, setConfig] = useState({ quantum: 2, aging: 1 });
  const [results, setResults] = useState(null);
  const [diagramData, setDiagramData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const handleProcessesChange = (newProcesses) => {
    setProcesses(newProcesses);
  };

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
  };

  const handleDiagramAlgorithmChange = async (algorithm) => {
    if (!processes || processes.length === 0) {
      alert('Adicione pelo menos um processo antes de executar a simulação.');
      return;
    }

    setIsLoading(true);
    setResults(null);
    setDiagramData(null);

    try {
      const simulationData = {
        processes: processes,
        algorithm: algorithm,
        config: config
      };

      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? '' // Usa a mesma URL da Vercel em produção
        : 'http://localhost:5001'; // Localhost em desenvolvimento

      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulationData)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // console.log('App - Dados recebidos da API:', data);
        // console.log('App - DiagramData:', data.diagramData);
        
        setResults({
          avgTurnaroundTime: data.avgTurnaroundTime,
          avgWaitingTime: data.avgWaitingTime,
          contextSwitches: data.contextSwitches,
          algorithm: data.algorithm
        });
        setDiagramData(data.diagramData);
        setSelectedAlgorithm(algorithm);
      } else {
        throw new Error(data.error || 'Erro desconhecido na simulação');
      }
    } catch (error) {
      console.error('Erro na simulação:', error);
      alert(`Erro ao executar simulação: ${error.message}. Verifique se o servidor Python está rodando.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const runSimulation = async (processList) => {
    setIsLoading(true);
    setResults(null);
    setDiagramData(null);

    try {
      const simulationData = {
        processes: processList,
        algorithm: selectedAlgorithm,
        config: config
      };

      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? '' // Usa a mesma URL da Vercel em produção
        : 'http://localhost:5001'; // Localhost em desenvolvimento

      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulationData)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // console.log('App - Dados recebidos da API:', data);
        // console.log('App - DiagramData:', data.diagramData);
        
        setResults({
          avgTurnaroundTime: data.avgTurnaroundTime,
          avgWaitingTime: data.avgWaitingTime,
          contextSwitches: data.contextSwitches,
          algorithm: data.algorithm
        });
        setDiagramData(data.diagramData);
        setActiveTab('results');
      } else {
        throw new Error(data.error || 'Erro desconhecido na simulação');
      }
    } catch (error) {
      console.error('Erro na simulação:', error);
      alert(`Erro ao executar simulação: ${error.message}. Verifique se o servidor Python está rodando.`);
    } finally {
      setIsLoading(false);
    }
  };


  const tabs = [
    { id: 'input', label: 'Entrada', icon: <Settings size={16} /> },
    { id: 'algorithm', label: 'Algoritmo', icon: <Cpu size={16} /> },
    { id: 'results', label: 'Resultados', icon: <BarChart3 size={16} /> },
    { id: 'diagram', label: 'Diagrama', icon: <Clock size={16} /> }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <Cpu size={32} />
            <h1>SchedulerAI PRO</h1>
          </div>
          <div className="header-subtitle">
            <p>Sistemas Operacionais - UFC</p>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <div className="main-content">
          {activeTab === 'input' && (
            <ProcessInput
              onProcessesChange={handleProcessesChange}
              onRunSimulation={runSimulation}
            />
          )}

          {activeTab === 'algorithm' && (
            <AlgorithmSelector
              onAlgorithmChange={handleAlgorithmChange}
              onConfigChange={handleConfigChange}
            />
          )}

          {activeTab === 'results' && (
            <ResultsDisplay
              results={results}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'diagram' && (
            <DiagramViewer
              diagramData={diagramData}
              isLoading={isLoading}
              inputProcesses={processes}
              onAlgorithmChange={handleDiagramAlgorithmChange}
              selectedAlgorithm={selectedAlgorithm}
              config={config}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2025 - SchedulerAI PRO</p>
          <p>Desenvolvido para a disciplina de Sistemas Operacionais - UFC</p>
        </div>
      </footer>

      {/* Créditos dos desenvolvedores */}
      <div className="developers-credits">
        <div className="credits-content">
          <div className="credits-label">Desenvolvido por:</div>
          <div className="developers-list">
            <span className="developer-name">Paulo Guilherme de Almeida Silva</span>
            <span className="developer-name">João Guilherme Lopes Batista de Oliveira</span>
            <span className="developer-name">Gabriel Pinheiro Muniz Cunha</span>
            <span className="developer-name">Gabriel da Silveira Miranda</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;