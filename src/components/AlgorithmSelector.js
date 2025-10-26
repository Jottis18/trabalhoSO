import React, { useState } from 'react';
import { Settings, Clock, Zap, Target, RotateCcw } from 'lucide-react';

const AlgorithmSelector = ({ onAlgorithmChange, onConfigChange }) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('FCFS');
  const [config, setConfig] = useState({
    quantum: 2,
    aging: 1
  });

  const algorithms = [
    {
      id: 'FCFS',
      name: 'First-Come First-Served',
      description: 'Processos são executados na ordem de chegada',
      icon: <Clock size={20} />,
      preemptive: false
    },
    {
      id: 'SJF',
      name: 'Shortest Job First',
      description: 'Processo com menor duração executa primeiro',
      icon: <Zap size={20} />,
      preemptive: false
    },
    {
      id: 'SRTF',
      name: 'Shortest Remaining Time First',
      description: 'Versão preemptiva do SJF',
      icon: <Zap size={20} />,
      preemptive: true
    },
    {
      id: 'PriorityNP',
      name: 'Priority (Non-Preemptive)',
      description: 'Executa por prioridade sem preempção',
      icon: <Target size={20} />,
      preemptive: false
    },
    {
      id: 'PriorityP',
      name: 'Priority (Preemptive)',
      description: 'Executa por prioridade com preempção',
      icon: <Target size={20} />,
      preemptive: true
    },
    {
      id: 'RoundRobin',
      name: 'Round Robin',
      description: 'Execução em fatias de tempo (quantum)',
      icon: <RotateCcw size={20} />,
      preemptive: true,
      needsQuantum: true
    },
    {
      id: 'RoundRobinPriorityAging',
      name: 'Round Robin com Prioridade e Envelhecimento',
      description: 'RR com prioridade e aumento de prioridade ao longo do tempo',
      icon: <RotateCcw size={20} />,
      preemptive: true,
      needsQuantum: true,
      needsAging: true
    }
  ];

  const handleAlgorithmChange = (algorithmId) => {
    setSelectedAlgorithm(algorithmId);
    onAlgorithmChange(algorithmId);
  };

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: parseInt(value) || 0 };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const selectedAlg = algorithms.find(alg => alg.id === selectedAlgorithm);

  return (
    <div className="algorithm-selector-container">
      <div className="algorithm-selector-header">
        <h2>Algoritmo de Escalonamento</h2>
        <Settings size={24} />
      </div>

      <div className="algorithms-grid">
        {algorithms.map(algorithm => (
          <div
            key={algorithm.id}
            className={`algorithm-card ${selectedAlgorithm === algorithm.id ? 'selected' : ''}`}
            onClick={() => handleAlgorithmChange(algorithm.id)}
          >
            <div className="algorithm-icon">
              {algorithm.icon}
            </div>
            <div className="algorithm-info">
              <h3>{algorithm.name}</h3>
              <p>{algorithm.description}</p>
              <div className="algorithm-tags">
                <span className={`tag ${algorithm.preemptive ? 'preemptive' : 'non-preemptive'}`}>
                  {algorithm.preemptive ? 'Preemptivo' : 'Não-Preemptivo'}
                </span>
                {algorithm.needsQuantum && (
                  <span className="tag quantum">Requer Quantum</span>
                )}
                {algorithm.needsAging && (
                  <span className="tag aging">Requer Envelhecimento</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(selectedAlg?.needsQuantum || selectedAlg?.needsAging) && (
        <div className="config-panel">
          <h3>Configurações do Algoritmo</h3>
          <div className="config-inputs">
            {selectedAlg.needsQuantum && (
              <div className="config-input">
                <label htmlFor="quantum">Quantum (unidades de tempo):</label>
                <input
                  id="quantum"
                  type="number"
                  min="1"
                  value={config.quantum}
                  onChange={(e) => handleConfigChange('quantum', e.target.value)}
                  className="config-number-input"
                />
              </div>
            )}
            {selectedAlg.needsAging && (
              <div className="config-input">
                <label htmlFor="aging">Taxa de Envelhecimento:</label>
                <input
                  id="aging"
                  type="number"
                  min="1"
                  value={config.aging}
                  onChange={(e) => handleConfigChange('aging', e.target.value)}
                  className="config-number-input"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="algorithm-description">
        <h4>Sobre o {selectedAlg?.name}:</h4>
        <p>{selectedAlg?.description}</p>
        {selectedAlg?.preemptive ? (
          <p className="preemptive-info">
            <strong>Preemptivo:</strong> Processos podem ser interrompidos durante a execução.
          </p>
        ) : (
          <p className="non-preemptive-info">
            <strong>Não-Preemptivo:</strong> Processos executam completamente antes de serem substituídos.
          </p>
        )}
      </div>
    </div>
  );
};

export default AlgorithmSelector;
