import React from 'react';
import { BarChart3, Clock, RefreshCw, TrendingUp } from 'lucide-react';

const ResultsDisplay = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="results-container loading">
        <div className="loading-spinner">
          <RefreshCw size={32} className="spinning" />
          <p>Executando simulação...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-container empty">
        <div className="empty-state">
          <BarChart3 size={48} />
          <h3>Nenhum resultado disponível</h3>
          <p>Execute uma simulação para ver os resultados aqui.</p>
        </div>
      </div>
    );
  }

  const { avgTurnaroundTime, avgWaitingTime, contextSwitches, algorithm } = results;

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Resultados da Simulação</h2>
        <div className="algorithm-badge">
          {algorithm}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>Tempo Médio de Vida</h3>
            <div className="metric-value">
              {avgTurnaroundTime.toFixed(2)}
            </div>
            <div className="metric-unit">unidades de tempo</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Tempo Médio de Espera</h3>
            <div className="metric-value">
              {avgWaitingTime.toFixed(2)}
            </div>
            <div className="metric-unit">unidades de tempo</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <RefreshCw size={24} />
          </div>
          <div className="metric-content">
            <h3>Trocas de Contexto</h3>
            <div className="metric-value">
              {contextSwitches}
            </div>
            <div className="metric-unit">trocas</div>
          </div>
        </div>
      </div>

      <div className="performance-analysis">
        <h3>Análise de Performance</h3>
        <div className="analysis-grid">
          <div className="analysis-item">
            <h4>Eficiência</h4>
            <div className="efficiency-bar">
              <div 
                className="efficiency-fill"
                style={{ 
                  width: `${Math.min(100, Math.max(0, 100 - (avgWaitingTime / avgTurnaroundTime) * 100))}%` 
                }}
              ></div>
            </div>
            <p>
              {avgWaitingTime < avgTurnaroundTime * 0.5 ? 'Excelente' : 
               avgWaitingTime < avgTurnaroundTime * 0.7 ? 'Boa' : 'Regular'}
            </p>
          </div>

          <div className="analysis-item">
            <h4>Overhead</h4>
            <div className="overhead-indicator">
              {contextSwitches < 5 ? (
                <span className="low-overhead">Baixo</span>
              ) : contextSwitches < 10 ? (
                <span className="medium-overhead">Médio</span>
              ) : (
                <span className="high-overhead">Alto</span>
              )}
            </div>
            <p>
              {contextSwitches} trocas de contexto
            </p>
          </div>
        </div>
      </div>

      <div className="results-summary">
        <h3>Resumo</h3>
        <div className="summary-content">
          <p>
            O algoritmo <strong>{algorithm}</strong> processou os processos com:
          </p>
          <ul>
            <li>Tempo médio de vida de <strong>{avgTurnaroundTime.toFixed(2)}</strong> unidades</li>
            <li>Tempo médio de espera de <strong>{avgWaitingTime.toFixed(2)}</strong> unidades</li>
            <li><strong>{contextSwitches}</strong> trocas de contexto</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
