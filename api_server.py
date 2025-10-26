#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sys
import os

# Adiciona o diretório atual ao path para importar o SchedulerNoGUI
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from SchedulerNoGUI import SchedulerSimulator, Process

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend React

# Instância global do simulador
simulator = SchedulerSimulator()

@app.route('/api/simulate', methods=['POST'])
def simulate():
    try:
        data = request.get_json()
        
        # Extrai dados da requisição
        processes_data = data.get('processes', [])
        algorithm = data.get('algorithm', 'FCFS')
        config = data.get('config', {'quantum': 2, 'aging': 1})
        
        # Validação básica
        if not processes_data:
            return jsonify({'error': 'Nenhum processo fornecido'}), 400
        
        # Converte dados dos processos para objetos Process
        processes = []
        for i, proc_data in enumerate(processes_data):
            process = Process(
                id=f"P{i+1}",
                creation_time=int(proc_data.get('creationTime', 0)),
                duration=int(proc_data.get('duration', 1)),
                priority=int(proc_data.get('priority', 1))
            )
            processes.append(process)
        
        # Configura o simulador
        simulator.processes = processes
        simulator.config = config
        simulator.set_strategy(algorithm)
        
        # Executa a simulação
        processes_copy = [p.clone() for p in processes]
        avg_tt, avg_wt, context_switches, diagram_str = simulator.current_strategy.schedule(processes_copy, config)
        
        # Processa o diagrama para formato JSON
        diagram_data = parse_diagram(diagram_str, processes)
        
        # Retorna os resultados
        result = {
            'success': True,
            'algorithm': algorithm,
            'avgTurnaroundTime': avg_tt,
            'avgWaitingTime': avg_wt,
            'contextSwitches': context_switches,
            'diagramData': diagram_data,
            'rawDiagram': diagram_str
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def parse_diagram(diagram_str, processes):
    """Converte o diagrama de texto para formato JSON estruturado"""
    lines = diagram_str.strip().split('\n')
    
    if len(lines) < 3:
        return {'processes': [], 'maxTime': 0}
    
    # Debug: imprimir o diagrama para entender o formato (comentado)
    # print("=== DIAGRAMA RECEBIDO ===")
    # for i, line in enumerate(lines):
    #     print(f"Linha {i}: '{line}'")
    # print("========================")
    
    # Encontra a linha de cabeçalho (primeira linha com dados)
    header_line = None
    header_index = 0
    
    for i, line in enumerate(lines):
        if 'tempo' in line and '|' in line:
            header_line = line
            header_index = i
            break
    
    if not header_line:
        return {'processes': [], 'maxTime': 0}
    
    # Processa o cabeçalho
    headers = [h.strip() for h in header_line.split('|')]
    process_ids = [h for h in headers[1:] if h and h != 'tempo']
    
    # print(f"Process IDs encontrados: {process_ids}")
    
    # Processa as linhas de dados (após o cabeçalho)
    process_timelines = {}
    max_time = 0
    
    for line in lines[header_index + 2:]:  # Pula cabeçalho e linha de separação
        if not line.strip() or '---' in line:
            continue
            
        parts = [p.strip() for p in line.split('|')]
        if len(parts) < 2:
            continue
            
        time_info = parts[0]
        if '-' not in time_info:
            continue
            
        try:
            time_start = int(time_info.split('-')[0])
        except ValueError:
            continue
        
        # Processa cada processo nesta linha de tempo
        for i, process_id in enumerate(process_ids):
            if i + 1 < len(parts):
                state_symbol = parts[i + 1].strip()
                
                if process_id not in process_timelines:
                    process_timelines[process_id] = []
                
                # Converte símbolos para estados
                if state_symbol == '##':
                    state = 'running'
                elif state_symbol == '--':
                    state = 'waiting'
                elif state_symbol == '✓':
                    state = 'completed'
                elif state_symbol == '  ' or state_symbol == '':
                    state = 'idle'
                else:
                    state = 'idle'
                
                process_timelines[process_id].append(state)
                max_time = max(max_time, time_start + 1)
    
    # Converte para formato esperado pelo frontend
    processes_list = []
    for process_id in process_ids:
        timeline = process_timelines.get(process_id, [])
        processes_list.append({
            'id': process_id,
            'timeline': timeline
        })
    
    # print(f"Timeline final: {processes_list}")
    # print(f"Max time: {max_time}")
    
    return {
        'processes': processes_list,
        'maxTime': max_time
    }

@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    """Retorna lista de algoritmos disponíveis"""
    algorithms = [
        {
            'id': 'FCFS',
            'name': 'First-Come First-Served',
            'description': 'Processos são executados na ordem de chegada',
            'preemptive': False
        },
        {
            'id': 'SJF',
            'name': 'Shortest Job First',
            'description': 'Processo com menor duração executa primeiro',
            'preemptive': False
        },
        {
            'id': 'SRTF',
            'name': 'Shortest Remaining Time First',
            'description': 'Versão preemptiva do SJF',
            'preemptive': True
        },
        {
            'id': 'PriorityNP',
            'name': 'Priority (Non-Preemptive)',
            'description': 'Executa por prioridade sem preempção',
            'preemptive': False
        },
        {
            'id': 'PriorityP',
            'name': 'Priority (Preemptive)',
            'description': 'Executa por prioridade com preempção',
            'preemptive': True
        },
        {
            'id': 'RoundRobin',
            'name': 'Round Robin',
            'description': 'Execução em fatias de tempo (quantum)',
            'preemptive': True,
            'needsQuantum': True
        },
        {
            'id': 'RoundRobinPriorityAging',
            'name': 'Round Robin com Prioridade e Envelhecimento',
            'description': 'RR com prioridade e aumento de prioridade ao longo do tempo',
            'preemptive': True,
            'needsQuantum': True,
            'needsAging': True
        }
    ]
    
    return jsonify({'algorithms': algorithms})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de saúde da API"""
    return jsonify({'status': 'healthy', 'message': 'API funcionando corretamente'})

if __name__ == '__main__':
    print("Iniciando servidor da API...")
    print("Frontend React deve estar rodando em http://localhost:3000")
    print("API disponível em http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
