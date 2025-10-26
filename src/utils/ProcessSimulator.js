// Simulador de algoritmos de escalonamento para funcionar sem backend
class ProcessSimulator {
  constructor() {
    this.processes = [];
    this.currentTime = 0;
    this.completedProcesses = [];
    this.contextSwitches = 0;
  }

  // Simula FCFS (First-Come First-Served)
  simulateFCFS(processes) {
    const sortedProcesses = [...processes].sort((a, b) => a.creationTime - b.creationTime);
    let currentTime = 0;
    let totalTurnaround = 0;
    let totalWaiting = 0;
    let contextSwitches = 0;

    const processTimelines = {};

    // Inicializa timelines
    processes.forEach(p => {
      processTimelines[p.id] = [];
    });

    sortedProcesses.forEach(process => {
      const startTime = Math.max(currentTime, process.creationTime);
      const endTime = startTime + process.duration;
      
      // Preenche timeline até o tempo de início
      for (let t = currentTime; t < startTime; t++) {
        processes.forEach(p => {
          if (processTimelines[p.id].length <= t) {
            processTimelines[p.id].push('idle');
          }
        });
      }

      // Executa processo
      for (let t = startTime; t < endTime; t++) {
        processes.forEach(p => {
          if (processTimelines[p.id].length <= t) {
            processTimelines[p.id].push('idle');
          }
        });
        processTimelines[process.id][startTime] = 'running';
      }

      const turnaroundTime = endTime - process.creationTime;
      const waitingTime = startTime - process.creationTime;

      totalTurnaround += turnaroundTime;
      totalWaiting += waitingTime;
      currentTime = endTime;
      contextSwitches++;
    });

    return {
      avgTurnaroundTime: totalTurnaround / processes.length,
      avgWaitingTime: totalWaiting / processes.length,
      contextSwitches: contextSwitches - 1,
      diagramData: {
        processes: processes.map(p => ({
          id: `P${p.id}`,
          timeline: processTimelines[p.id] || []
        })),
        maxTime: currentTime
      }
    };
  }

  // Simula SJF (Shortest Job First)
  simulateSJF(processes) {
    const sortedProcesses = [...processes].sort((a, b) => {
      if (a.creationTime !== b.creationTime) {
        return a.creationTime - b.creationTime;
      }
      return a.duration - b.duration;
    });

    let currentTime = 0;
    let totalTurnaround = 0;
    let totalWaiting = 0;
    let contextSwitches = 0;

    const processTimelines = {};
    processes.forEach(p => {
      processTimelines[p.id] = [];
    });

    sortedProcesses.forEach(process => {
      const startTime = Math.max(currentTime, process.creationTime);
      const endTime = startTime + process.duration;
      
      // Preenche timeline
      for (let t = currentTime; t < endTime; t++) {
        processes.forEach(p => {
          if (processTimelines[p.id].length <= t) {
            processTimelines[p.id].push('idle');
          }
        });
        if (t >= startTime && t < endTime) {
          processTimelines[process.id][t] = 'running';
        }
      }

      const turnaroundTime = endTime - process.creationTime;
      const waitingTime = startTime - process.creationTime;

      totalTurnaround += turnaroundTime;
      totalWaiting += waitingTime;
      currentTime = endTime;
      contextSwitches++;
    });

    return {
      avgTurnaroundTime: totalTurnaround / processes.length,
      avgWaitingTime: totalWaiting / processes.length,
      contextSwitches: contextSwitches - 1,
      diagramData: {
        processes: processes.map(p => ({
          id: `P${p.id}`,
          timeline: processTimelines[p.id] || []
        })),
        maxTime: currentTime
      }
    };
  }

  // Simula Round Robin
  simulateRoundRobin(processes, quantum = 2) {
    const processTimelines = {};
    processes.forEach(p => {
      processTimelines[p.id] = [];
    });

    let currentTime = 0;
    let totalTurnaround = 0;
    let totalWaiting = 0;
    let contextSwitches = 0;

    const queue = [...processes].sort((a, b) => a.creationTime - b.creationTime);
    const remainingTime = new Map();
    processes.forEach(p => {
      remainingTime.set(p.id, p.duration);
    });

    while (queue.length > 0) {
      const process = queue.shift();
      const startTime = Math.max(currentTime, process.creationTime);
      const executionTime = Math.min(quantum, remainingTime.get(process.id));
      const endTime = startTime + executionTime;

      // Preenche timeline
      for (let t = currentTime; t < endTime; t++) {
        processes.forEach(p => {
          if (processTimelines[p.id].length <= t) {
            processTimelines[p.id].push('idle');
          }
        });
        if (t >= startTime && t < endTime) {
          processTimelines[process.id][t] = 'running';
        }
      }

      remainingTime.set(process.id, remainingTime.get(process.id) - executionTime);
      currentTime = endTime;

      if (remainingTime.get(process.id) > 0) {
        queue.push(process);
        contextSwitches++;
      } else {
        const turnaroundTime = currentTime - process.creationTime;
        const waitingTime = turnaroundTime - process.duration;
        totalTurnaround += turnaroundTime;
        totalWaiting += waitingTime;
      }
    }

    return {
      avgTurnaroundTime: totalTurnaround / processes.length,
      avgWaitingTime: totalWaiting / processes.length,
      contextSwitches,
      diagramData: {
        processes: processes.map(p => ({
          id: `P${p.id}`,
          timeline: processTimelines[p.id] || []
        })),
        maxTime: currentTime
      }
    };
  }

  // Simula Priority (Non-Preemptive)
  simulatePriority(processes) {
    const sortedProcesses = [...processes].sort((a, b) => {
      if (a.creationTime !== b.creationTime) {
        return a.creationTime - b.creationTime;
      }
      return a.priority - b.priority;
    });

    let currentTime = 0;
    let totalTurnaround = 0;
    let totalWaiting = 0;
    let contextSwitches = 0;

    const processTimelines = {};
    processes.forEach(p => {
      processTimelines[p.id] = [];
    });

    sortedProcesses.forEach(process => {
      const startTime = Math.max(currentTime, process.creationTime);
      const endTime = startTime + process.duration;
      
      // Preenche timeline
      for (let t = currentTime; t < endTime; t++) {
        processes.forEach(p => {
          if (processTimelines[p.id].length <= t) {
            processTimelines[p.id].push('idle');
          }
        });
        if (t >= startTime && t < endTime) {
          processTimelines[process.id][t] = 'running';
        }
      }

      const turnaroundTime = endTime - process.creationTime;
      const waitingTime = startTime - process.creationTime;

      totalTurnaround += turnaroundTime;
      totalWaiting += waitingTime;
      currentTime = endTime;
      contextSwitches++;
    });

    return {
      avgTurnaroundTime: totalTurnaround / processes.length,
      avgWaitingTime: totalWaiting / processes.length,
      contextSwitches: contextSwitches - 1,
      diagramData: {
        processes: processes.map(p => ({
          id: `P${p.id}`,
          timeline: processTimelines[p.id] || []
        })),
        maxTime: currentTime
      }
    };
  }

  // Função principal de simulação
  simulate(processes, algorithm, config = {}) {
    const quantum = config.quantum || 2;
    
    switch (algorithm) {
      case 'FCFS':
        return this.simulateFCFS(processes);
      case 'SJF':
        return this.simulateSJF(processes);
      case 'SRTF':
        return this.simulateSJF(processes); // Simplificado
      case 'PriorityNP':
        return this.simulatePriority(processes);
      case 'PriorityP':
        return this.simulatePriority(processes); // Simplificado
      case 'RoundRobin':
        return this.simulateRoundRobin(processes, quantum);
      case 'RoundRobinPriorityAging':
        return this.simulateRoundRobin(processes, quantum);
      default:
        return this.simulateFCFS(processes);
    }
  }
}

export default ProcessSimulator;
