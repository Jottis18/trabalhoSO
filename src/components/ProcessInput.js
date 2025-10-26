import React, { useState } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';

const ProcessInput = ({ onProcessesChange, onRunSimulation }) => {
  const [processes, setProcesses] = useState([
    { id: 1, creationTime: 0, duration: 3, priority: 1 }
  ]);

  const addProcess = () => {
    const newId = Math.max(...processes.map(p => p.id)) + 1;
    setProcesses([...processes, { 
      id: newId, 
      creationTime: 0, 
      duration: 1, 
      priority: 1 
    }]);
  };

  const removeProcess = (id) => {
    if (processes.length > 1) {
      setProcesses(processes.filter(p => p.id !== id));
    }
  };

  const updateProcess = (id, field, value) => {
    const updatedProcesses = processes.map(p => 
      p.id === id ? { ...p, [field]: parseInt(value) || 0 } : p
    );
    setProcesses(updatedProcesses);
    onProcessesChange(updatedProcesses);
  };

  const handleRunSimulation = () => {
    onRunSimulation(processes);
  };

  return (
    <div className="process-input-container">
      <div className="process-input-header">
        <h2>Entrada de Processos</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={addProcess}
            title="Adicionar Processo"
          >
            <Plus size={16} />
            Adicionar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleRunSimulation}
            title="Executar Simulação"
          >
            <Play size={16} />
            Executar
          </button>
        </div>
      </div>

      <div className="process-table-container">
        <table className="process-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tempo de Chegada</th>
              <th>Duração</th>
              <th>Prioridade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(process => (
              <tr key={process.id}>
                <td className="process-id">P{process.id}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={process.creationTime}
                    onChange={(e) => updateProcess(process.id, 'creationTime', e.target.value)}
                    className="number-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={process.duration}
                    onChange={(e) => updateProcess(process.id, 'duration', e.target.value)}
                    className="number-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={process.priority}
                    onChange={(e) => updateProcess(process.id, 'priority', e.target.value)}
                    className="number-input"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeProcess(process.id)}
                    disabled={processes.length === 1}
                    title="Remover Processo"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="process-info">
        <p><strong>Instruções:</strong></p>
        <ul>
          <li><strong>Tempo de Chegada:</strong> Momento em que o processo chega ao sistema</li>
          <li><strong>Duração:</strong> Tempo necessário para completar o processo</li>
          <li><strong>Prioridade:</strong> Menor número = maior prioridade</li>
        </ul>
      </div>
    </div>
  );
};

export default ProcessInput;
