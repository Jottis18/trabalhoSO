import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Cpu } from 'lucide-react';

const DiagramViewer = ({ diagramData, isLoading, inputProcesses, onAlgorithmChange, selectedAlgorithm, config }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Debug: log dos dados recebidos (comentado)
  // console.log('DiagramViewer - diagramData:', diagramData);
  // console.log('DiagramViewer - isLoading:', isLoading);

  const algorithms = [
    { id: 'FCFS', name: 'FCFS' },
    { id: 'SJF', name: 'SJF' },
    { id: 'SRTF', name: 'SRTF' },
    { id: 'PriorityNP', name: 'Priority NP' },
    { id: 'PriorityP', name: 'Priority P' },
    { id: 'RoundRobin', name: 'Round Robin' },
    { id: 'RoundRobinPriorityAging', name: 'RR + Priority + Aging' }
  ];

  const handleAlgorithmChange = (algorithmId) => {
    if (onAlgorithmChange) {
      onAlgorithmChange(algorithmId);
    }
  };

  if (isLoading) {
    return (
      <div className="diagram-container loading">
        <div className="loading-spinner">
          <RotateCcw size={32} className="spinning" />
          <p>Gerando diagrama...</p>
        </div>
      </div>
    );
  }

  if (!diagramData || !diagramData.processes || diagramData.processes.length === 0) {
    // console.log('DiagramViewer - Mostrando estado vazio');
    return (
      <div className="diagram-container empty">
        <div className="empty-state">
          <Play size={48} />
          <h3>Nenhum diagrama disponível</h3>
          <p>Execute uma simulação para ver o diagrama de tempo aqui.</p>
        </div>
      </div>
    );
  }

  const { processes, maxTime } = diagramData;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetDiagram = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5));
  };

  const getProcessState = (processId, time) => {
    const process = processes.find(p => p.id === processId);
    if (!process || time >= process.timeline.length) return 'idle';
    return process.timeline[time];
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'running': return '#4ade80'; // green
      case 'waiting': return '#f59e0b'; // amber
      case 'completed': return '#6b7280'; // gray
      case 'idle': return '#e5e7eb'; // light gray
      default: return '#e5e7eb';
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case 'running': return 'Executando';
      case 'waiting': return 'Esperando';
      case 'completed': return 'Concluído';
      case 'idle': return 'Ocioso';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="diagram-container">
      <div className="diagram-header">
        <h2>Diagrama de Tempo</h2>
        <div className="diagram-controls">
          <div className="algorithm-selector">
            <Cpu size={16} />
            <select 
              value={selectedAlgorithm || 'FCFS'} 
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              className="algorithm-dropdown"
            >
              {algorithms.map(alg => (
                <option key={alg.id} value={alg.id}>
                  {alg.name}
                </option>
              ))}
            </select>
          </div>
          <div className="playback-controls">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={togglePlay}
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={resetDiagram}
              title="Reiniciar"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="zoom-controls">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleZoomOut}
              title="Diminuir zoom"
            >
              <ZoomOut size={16} />
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleZoomIn}
              title="Aumentar zoom"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="diagram-content" style={{ transform: `scale(${zoom})` }}>
        <div className="timeline-container">
          <div className="timeline-grid">
            {/* Cabeçalho com espaçamento para o label */}
            <div className="timeline-row">
              <div className="time-label" style={{ visibility: 'hidden' }}>P1</div>
              {Array.from({ length: maxTime }, (_, i) => (
                <div key={i} className="time-label">
                  {i}
                </div>
              ))}
            </div>
            
            {/* Linhas de processo com label na esquerda */}
            {processes.map(process => (
              <div key={process.id} className="timeline-row">
                <div className="process-label">
                  {process.id}
                </div>
                {Array.from({ length: maxTime }, (_, time) => {
                  const state = getProcessState(process.id, time);
                  return (
                    <div
                      key={time}
                      className="time-slot"
                      data-state={state}
                      title={`${process.id} - Tempo ${time}: ${getStateLabel(state)}`}
                    >
                      {state === 'running' && '##'}
                      {state === 'waiting' && '--'}
                      {state === 'idle' && '  '}
                      {state === 'completed' && '✓'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="diagram-legend">
        <h4>Legenda:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4ade80' }}></div>
            <span>Executando (##)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Esperando (--)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#6b7280' }}></div>
            <span>Concluído (✓)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#e5e7eb' }}></div>
            <span>Ocioso</span>
          </div>
        </div>
      </div>

      <div className="diagram-stats">
        <h4>Estatísticas do Diagrama:</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <strong>Total de Processos:</strong> {processes.length}
          </div>
          <div className="stat-item">
            <strong>Tempo Total:</strong> {maxTime} unidades
          </div>
          <div className="stat-item">
            <strong>Processos Concluídos:</strong> {processes.filter(p => p.timeline.some(t => t === 'completed')).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramViewer;
