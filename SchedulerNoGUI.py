#!/usr/bin/env python3

import sys
import copy
from abc import ABC, abstractmethod
from collections import deque

"""
DEPARTAMENTO DE COMPUTAÇÃO
UNIVERSIDADE FEDERAL DO CEARÁ
Disciplina: Sistemas Operacionais
Atividade Prática: Escalonamento de Processos
"""

# --- Classe para representar um Processo ---
# (Sugere-se que cada processo possua alguma estrutura que mapeie informações)
class Process:
    """
    Armazena o estado de um único processo, conforme descrito
    nas diretrizes de entrada.
    """
    def __init__(self, id, creation_time, duration, priority):
        self.id = id  # (implícito)
        self.creation_time = int(creation_time)  #
        self.duration = int(duration)  #
        self.static_priority = int(priority)  #

        # Estado dinâmico para simulação
        self.remaining_time = self.duration
        self.current_priority = self.static_priority
        self.start_time = -1  # Hora que executou pela 1ª vez
        self.completion_time = 0
        self.turnaround_time = 0  #
        self.waiting_time = 0  #
        self.quantum_slice = 0  # Para Round-Robin
        self.status = 'new'  # (sugestão de status)

    def clone(self):
        """Cria uma cópia limpa do processo para uma nova simulação."""
        return copy.deepcopy(self)

    def __repr__(self):
        return f"Process({self.id}, CT:{self.creation_time}, D:{self.duration}, P:{self.static_priority})"

# --- Função de Desempate ---
def _tie_break(eligible_processes, running_process):
    """
    Aplica as regras de desempate conforme especificado.
    Assume-se que 'eligible_processes' já contém apenas os processos
    que empataram na métrica principal (ex: mesma prioridade, ou
    mesmo tempo restante).
    """
    if not eligible_processes:
        return None

    # (i) o processo que já esteja com processador
    if running_process and running_process in eligible_processes and running_process.status == 'running':
        return running_process

    # (ii) processo com menor tempo restante de processamento
    min_remaining = min(p.remaining_time for p in eligible_processes)
    tied_on_remaining = [p for p in eligible_processes if p.remaining_time == min_remaining]

    if len(tied_on_remaining) == 1:
        return tied_on_remaining[0]

    # (iii) escolha aleatória (usamos ID para ser determinístico)
    return sorted(tied_on_remaining, key=lambda p: p.id)[0]


# --- Padrão Strategy: Interface e Classes Base ---

class SchedulingStrategy(ABC):
    """
    Interface (Strategy) para todos os algoritmos de escalonamento.
    """
    @abstractmethod
    def schedule(self, processes, config):
        """
        Executa a simulação de escalonamento.
        Retorna: (avg_tt, avg_wt, context_switches, diagram_str)
        """
        pass

    def _calculate_stats(self, completed_processes):
        """Calcula estatísticas médias de turnaround e espera."""
        if not completed_processes:
            return 0, 0
        total_tt = sum(p.turnaround_time for p in completed_processes)  #
        total_wt = sum(p.waiting_time for p in completed_processes)  #
        n = len(completed_processes)
        return total_tt / n, total_wt / n

    def _format_diagram(self, diagram_data, pids):
        """Formata o diagrama de tempo vertical."""
        if not pids:
            return "Nenhum processo para exibir no diagrama."

        # Garante que todas as colunas tenham o mesmo comprimento
        max_time = 0
        if diagram_data and pids[0] in diagram_data and diagram_data[pids[0]]:
            max_time = len(diagram_data[pids[0]])
        
        for pid in pids:
            if pid not in diagram_data: diagram_data[pid] = []
            if len(diagram_data[pid]) < max_time:
                 diagram_data[pid].extend(['  '] * (max_time - len(diagram_data[pid])))

        # (MODIFICADO) Garante que a largura da coluna seja pelo menos 2 (para ## e --)
        col_widths = [max(len(pid), 2) for pid in pids]
        header = ["tempo".ljust(5)] + [pid.ljust(w) for pid, w in zip(pids, col_widths)]
        lines = [" | ".join(header)]
        lines.append("-" * (len(lines[0])))

        for t in range(max_time):
            time_label = f"{t}-{t+1}"
            row = [time_label.ljust(5)]
            for i, pid in enumerate(pids):
                # Pega o dado, garante que é string, e alinha
                data = diagram_data[pid][t] if t < len(diagram_data[pid]) else '  '
                row.append(str(data).ljust(col_widths[i]))
            lines.append(" | ".join(row))
        return "\n".join(lines)

class NonPreemptiveStrategy(SchedulingStrategy):
    """
    Classe base para algoritmos não-preemptivos (FCFS, SJF, PriorityNP).
    Implementa o loop de simulação genérico. (conceito colaborativo)
    """
    @abstractmethod
    def select_next_process(self, ready_queue, running_process):
        """Hook (parte do padrão Template Method) para a lógica de seleção."""
        pass

    def schedule(self, processes, config):
        current_time = 0
        context_switches = 0  #
        running_process = None
        
        pids = sorted([p.id for p in processes])
        diagram_data = {pid: [] for pid in pids}
        # (MODIFICADO) Mapa para consulta rápida do tempo de criação
        process_map = {p.id: p for p in processes}
        
        # Fila de processos que ainda não chegaram
        process_queue = sorted(processes, key=lambda p: (p.creation_time, p.id))
        ready_queue = []
        completed = []

        while len(completed) < len(processes):
            # 1. Adiciona processos que chegam agora à fila de prontos
            while process_queue and process_queue[0].creation_time <= current_time:
                new_p = process_queue.pop(0)
                new_p.status = 'ready'
                ready_queue.append(new_p)
                        
            # 2. Se CPU está ociosa, seleciona um novo processo
            if running_process is None:
                if ready_queue:
                    # A "estratégia" real é injetada aqui
                    running_process = self.select_next_process(ready_queue, None)
                    
                    ready_queue.remove(running_process)
                    running_process.status = 'running'
                    if running_process.start_time == -1:
                        running_process.start_time = current_time
                    context_switches += 1
                else:
                    # 3. CPU Ociosa e sem processos prontos
                    if not process_queue:
                        break  # Acabaram os processos
                    
                    # Salta o tempo para a próxima chegada
                    next_arrival = process_queue[0].creation_time
                    idle_ticks = next_arrival - current_time
                    
                    # (MODIFICADO) Grava ' ' para ociosidade ou 'não chegado'
                    for t_idle in range(idle_ticks):
                        t_now = current_time + t_idle
                        for pid in pids:
                            # CPU ociosa, ready_queue vazia. Ninguém é ## ou --.
                            if t_now < process_map[pid].creation_time:
                                diagram_data[pid].append('  ') # Não chegou
                            else:
                                diagram_data[pid].append('  ') # Terminou
                    
                    current_time = next_arrival
                    continue  # Reinicia o loop no novo tempo

            # 4. Simula 1 unidade de tempo
            if running_process:
                # (MODIFICADO) Lógica do diagrama para incluir espera
                ready_pids = {p.id for p in ready_queue}
                
                for pid in pids:
                    if pid == running_process.id:
                        diagram_data[pid].append('##') # Em execução
                    elif pid in ready_pids:
                        diagram_data[pid].append('--') # Em espera
                    else:
                        # Não executando, não esperando.
                        if current_time < process_map[pid].creation_time:
                            diagram_data[pid].append('  ') # Não chegou
                        else:
                            diagram_data[pid].append('  ') # Terminou
                
                running_process.remaining_time -= 1

                # 5. Verifica se o processo terminou
                if running_process.remaining_time == 0:
                    running_process.status = 'completed'
                    running_process.completion_time = current_time + 1
                    running_process.turnaround_time = running_process.completion_time - running_process.creation_time  #
                    running_process.waiting_time = running_process.turnaround_time - running_process.duration  #
                    completed.append(running_process)
                    running_process = None
            
            current_time += 1
        
        avg_tt, avg_wt = self._calculate_stats(completed)
        diagram_str = self._format_diagram(diagram_data, pids)
        
        # A primeira carga não é uma "troca"
        final_switches = context_switches - 1 if context_switches > 0 else 0
        return avg_tt, avg_wt, final_switches, diagram_str #

class PreemptiveStrategy(SchedulingStrategy):
    """
    Classe base para algoritmos preemptivos (SRTF, PriorityP).
    Implementa o loop de simulação genérico. (conceito preemptivo)
    """
    @abstractmethod
    def select_next_process(self, candidates, running_process):
        """Hook para a lógica de seleção (inclui desempate)."""
        pass

    def schedule(self, processes, config):
        current_time = 0
        context_switches = 0  #
        running_process = None
        last_running_process = None
        
        pids = sorted([p.id for p in processes])
        diagram_data = {pid: [] for pid in pids}
        # (MODIFICADO) Mapa para consulta rápida do tempo de criação
        process_map = {p.id: p for p in processes}
        
        process_queue = sorted(processes, key=lambda p: (p.creation_time, p.id))
        ready_queue = []
        completed = []
        
        while len(completed) < len(processes):
            # 1. Adiciona processos que chegam agora
            while process_queue and process_queue[0].creation_time <= current_time:
                new_p = process_queue.pop(0)
                new_p.status = 'ready'
                ready_queue.append(new_p)
                        
            # 2. Seleção preemptiva: candidatos = prontos + em execução
            candidates = list(ready_queue)
            if running_process:
                candidates.append(running_process)
                
            if not candidates:
                # 3. CPU Ociosa
                if not process_queue:
                    break  # Acabou
                
                # Salta o tempo para a próxima chegada
                next_arrival = process_queue[0].creation_time
                idle_ticks = next_arrival - current_time
                
                # (MODIFICADO) Grava ' ' para ociosidade ou 'não chegado'
                for t_idle in range(idle_ticks):
                    t_now = current_time + t_idle
                    for pid in pids:
                        if t_now < process_map[pid].creation_time:
                            diagram_data[pid].append('  ') # Não chegou
                        else:
                            diagram_data[pid].append('  ') # Terminou
                
                current_time = next_arrival
                continue

            # 4. A "estratégia" real é injetada aqui
            next_process = self.select_next_process(candidates, running_process)
            
            # 5. Lógica de troca de contexto
            if running_process != next_process:
                if running_process:  # Processo anterior foi preemptado
                    running_process.status = 'ready'
                    if running_process not in ready_queue:
                        ready_queue.append(running_process)
                
                running_process = next_process
                running_process.status = 'running'
                if running_process in ready_queue:
                    ready_queue.remove(running_process)
                
                if last_running_process != running_process: 
                    context_switches += 1
                    last_running_process = running_process

            if running_process.start_time == -1:
                running_process.start_time = current_time

            # 6. Simula 1 unidade de tempo
            # (MODIFICADO) Lógica do diagrama para incluir espera
            ready_pids = {p.id for p in ready_queue}

            for pid in pids:
                if pid == running_process.id:
                    diagram_data[pid].append('##') # Em execução
                elif pid in ready_pids:
                    diagram_data[pid].append('--') # Em espera
                else:
                    if current_time < process_map[pid].creation_time:
                        diagram_data[pid].append('  ') # Não chegou
                    else:
                        diagram_data[pid].append('  ') # Terminou
            
            running_process.remaining_time -= 1

            # 7. Verifica se o processo terminou
            if running_process.remaining_time == 0:
                running_process.status = 'completed'
                running_process.completion_time = current_time + 1
                running_process.turnaround_time = running_process.completion_time - running_process.creation_time  #
                running_process.waiting_time = running_process.turnaround_time - running_process.duration  #
                completed.append(running_process)
                running_process = None
                last_running_process = None
                
            current_time += 1
        
        avg_tt, avg_wt = self._calculate_stats(completed)
        diagram_str = self._format_diagram(diagram_data, pids)
        
        final_switches = context_switches - 1 if context_switches > 0 else 0
        return avg_tt, avg_wt, final_switches, diagram_str #


# --- Estratégias Concretas ---

class FCFSStrategy(NonPreemptiveStrategy):  #
    def select_next_process(self, ready_queue, running_process):
        # Seleciona pelo menor tempo de criação
        min_arrival = min(p.creation_time for p in ready_queue)
        eligible = [p for p in ready_queue if p.creation_time == min_arrival]
        # Aplica regras de desempate
        return _tie_break(eligible, running_process)

class SJFStrategy(NonPreemptiveStrategy):  #
    def select_next_process(self, ready_queue, running_process):
        # Seleciona pela menor duração total
        min_duration = min(p.duration for p in ready_queue)
        eligible = [p for p in ready_queue if p.duration == min_duration]
        # Aplica regras de desempate
        return _tie_break(eligible, running_process)

class PriorityNPStrategy(NonPreemptiveStrategy):  #
    def select_next_process(self, ready_queue, running_process):
        # Assume que MENOR número é MAIOR prioridade
        min_priority = min(p.static_priority for p in ready_queue)
        eligible = [p for p in ready_queue if p.static_priority == min_priority]
        # Aplica regras de desempate
        return _tie_break(eligible, running_process)

class SRTFStrategy(PreemptiveStrategy):  #
    def select_next_process(self, candidates, running_process):
        # Seleciona pelo menor tempo *restante*
        min_remaining = min(p.remaining_time for p in candidates)
        eligible = [p for p in candidates if p.remaining_time == min_remaining]
        # Aplica regras de desempate
        return _tie_break(eligible, running_process)

class PriorityPStrategy(PreemptiveStrategy):  #
    def select_next_process(self, candidates, running_process):
        # Assume que MENOR número é MAIOR prioridade
        min_priority = min(p.static_priority for p in candidates)
        eligible = [p for p in candidates if p.static_priority == min_priority]
        # Aplica regras de desempate
        return _tie_break(eligible, running_process)

class RoundRobinStrategy(SchedulingStrategy):  #
    """Implementa Round-Robin simples (sem prioridade), que é FIFO."""
    def schedule(self, processes, config):
        quantum = int(config.get('quantum', 2))  #
        current_time = 0
        context_switches = 0  #
        running_process = None
        last_running_process = None
        
        pids = sorted([p.id for p in processes])
        diagram_data = {pid: [] for pid in pids}
        # (MODIFICADO) Mapa para consulta rápida do tempo de criação
        process_map = {p.id: p for p in processes}
        
        process_queue = sorted(processes, key=lambda p: (p.creation_time, p.id))
        # Round-Robin usa uma fila (FIFO)
        ready_queue = deque()
        completed = []

        while len(completed) < len(processes):
            # 1. Adiciona novos processos ao FIM da fila
            while process_queue and process_queue[0].creation_time <= current_time:
                new_p = process_queue.pop(0)
                new_p.status = 'ready'
                ready_queue.append(new_p)
                        
            # 2. Se CPU ociosa, pega o próximo da INÍCIO da fila
            if running_process is None:
                if ready_queue:
                    running_process = ready_queue.popleft()  # FIFO
                    running_process.status = 'running'
                    running_process.quantum_slice = 0
                    
                    if last_running_process != running_process:
                        context_switches += 1
                        last_running_process = running_process
                    if running_process.start_time == -1:
                        running_process.start_time = current_time
                else:
                    # 3. CPU Ociosa
                    if not process_queue:
                        break  # Acabou
                    
                    next_arrival = process_queue[0].creation_time
                    idle_ticks = next_arrival - current_time
                    
                    # (MODIFICADO) Grava ' ' para ociosidade ou 'não chegado'
                    for t_idle in range(idle_ticks):
                        t_now = current_time + t_idle
                        for pid in pids:
                            if t_now < process_map[pid].creation_time:
                                diagram_data[pid].append('  ') # Não chegou
                            else:
                                diagram_data[pid].append('  ') # Terminou
                    
                    current_time = next_arrival
                    continue

            # 4. Simula 1 unidade de tempo
            # (MODIFICADO) Lógica do diagrama para incluir espera
            ready_pids = {p.id for p in ready_queue}

            for pid in pids:
                if pid == running_process.id:
                    diagram_data[pid].append('##') # Em execução
                elif pid in ready_pids:
                    diagram_data[pid].append('--') # Em espera
                else:
                    if current_time < process_map[pid].creation_time:
                        diagram_data[pid].append('  ') # Não chegou
                    else:
                        diagram_data[pid].append('  ') # Terminou
            
            running_process.remaining_time -= 1
            running_process.quantum_slice += 1

            # 5. Verifica se terminou
            if running_process.remaining_time == 0:
                running_process.status = 'completed'
                running_process.completion_time = current_time + 1
                running_process.turnaround_time = running_process.completion_time - running_process.creation_time  #
                running_process.waiting_time = running_process.turnaround_time - running_process.duration  #
                completed.append(running_process)
                running_process = None
                last_running_process = None
            
            # 6. Verifica se o quantum estourou
            elif running_process.quantum_slice == quantum:
                running_process.status = 'ready'
                ready_queue.append(running_process)  # Volta para o FIM da fila
                running_process = None
                last_running_process = None
            
            current_time += 1
        
        avg_tt, avg_wt = self._calculate_stats(completed)
        diagram_str = self._format_diagram(diagram_data, pids)
        
        final_switches = context_switches - 1 if context_switches > 0 else 0
        return avg_tt, avg_wt, final_switches, diagram_str #

class RoundRobinPriorityAgingStrategy(SchedulingStrategy):  #
    """
    Implementa RR com prioridade e envelhecimento.
    - Não há preempção por prioridade.
    - Envelhecimento ocorre a cada quantum.
    """
    def schedule(self, processes, config):
        quantum = int(config.get('quantum', 2))  #
        aging_rate = int(config.get('aging', 1))  #
        
        current_time = 0
        context_switches = 0  #
        running_process = None
        last_running_process = None
        
        pids = sorted([p.id for p in processes])
        diagram_data = {pid: [] for pid in pids}
        # (MODIFICADO) Mapa para consulta rápida do tempo de criação
        process_map = {p.id: p for p in processes}
        
        process_queue = sorted(processes, key=lambda p: (p.creation_time, p.id))
        # A fila de prontos não é FIFO, é selecionada por prioridade
        ready_queue = []
        completed = []

        while len(completed) < len(processes):
            # 1. Adiciona novos processos
            while process_queue and process_queue[0].creation_time <= current_time:
                new_p = process_queue.pop(0)
                new_p.status = 'ready'
                ready_queue.append(new_p)
                        
            # 2. Seleção (somente se CPU ociosa)
            # "não há preempção por prioridade"
            if running_process is None:
                if ready_queue:
                    # Seleciona por prioridade (menor número = maior prio)
                    min_priority = min(p.current_priority for p in ready_queue)
                    eligible = [p for p in ready_queue if p.current_priority == min_priority]
                    # Aplica desempate
                    running_process = _tie_break(eligible, None)
                    
                    ready_queue.remove(running_process)
                    running_process.status = 'running'
                    running_process.quantum_slice = 0
                    
                    if last_running_process != running_process:
                        context_switches += 1
                        last_running_process = running_process
                    if running_process.start_time == -1:
                        running_process.start_time = current_time
                else:
                    # 3. CPU Ociosa
                    if not process_queue:
                        break  # Acabou
                    
                    next_arrival = process_queue[0].creation_time
                    idle_ticks = next_arrival - current_time
                    
                    # (MODIFICADO) Grava ' ' para ociosidade ou 'não chegado'
                    for t_idle in range(idle_ticks):
                        t_now = current_time + t_idle
                        for pid in pids:
                            if t_now < process_map[pid].creation_time:
                                diagram_data[pid].append('  ') # Não chegou
                            else:
                                diagram_data[pid].append('  ') # Terminou
                    
                    current_time = next_arrival
                    continue

            # 4. Simula 1 unidade de tempo
            # (MODIFICADO) Lógica do diagrama para incluir espera
            ready_pids = {p.id for p in ready_queue}

            for pid in pids:
                if pid == running_process.id:
                    diagram_data[pid].append('##') # Em execução
                elif pid in ready_pids:
                    diagram_data[pid].append('--') # Em espera
                else:
                    if current_time < process_map[pid].creation_time:
                        diagram_data[pid].append('  ') # Não chegou
                    else:
                        diagram_data[pid].append('  ') # Terminou
            
            running_process.remaining_time -= 1
            running_process.quantum_slice += 1

            # 5. Verifica se terminou
            if running_process.remaining_time == 0:
                running_process.status = 'completed'
                running_process.completion_time = current_time + 1
                running_process.turnaround_time = running_process.completion_time - running_process.creation_time  #
                running_process.waiting_time = running_process.turnaround_time - running_process.duration  #
                completed.append(running_process)
                running_process = None
                last_running_process = None
            
            # 6. Verifica se o quantum estourou
            elif running_process.quantum_slice == quantum:
                running_process.status = 'ready'
                ready_queue.append(running_process)  # Volta para a fila de prontos
                running_process = None
                last_running_process = None

                # ENVELHECIMENTO: "ocorrer a cada quantum"
                # Aplica a todos na fila de prontos
                for p in ready_queue:
                    # Diminui o número da prioridade (aumenta a prioridade)
                    p.current_priority = max(0, p.current_priority - aging_rate)
            
            current_time += 1
        
        avg_tt, avg_wt = self._calculate_stats(completed)
        diagram_str = self._format_diagram(diagram_data, pids)
        
        final_switches = context_switches - 1 if context_switches > 0 else 0
        return avg_tt, avg_wt, final_switches, diagram_str #


# --- Classe "Contexto" do Padrão Strategy ---

class SchedulerSimulator:
    """
    Classe principal (Contexto) que gerencia e executa as
    diferentes estratégias de escalonamento.
    """
    def __init__(self):
        self.processes = []
        self.config = {}
        # Dicionário de estratégias disponíveis
        self.strategies = {
            "FCFS": FCFSStrategy(),  #
            "SJF": SJFStrategy(),  #
            "SRTF": SRTFStrategy(),  #
            "PriorityNP": PriorityNPStrategy(),  #
            "PriorityP": PriorityPStrategy(),  #
            "RoundRobin": RoundRobinStrategy(),  #
            "RoundRobinPriorityAging": RoundRobinPriorityAgingStrategy()  #
        }
        self.current_strategy = None

    def set_strategy(self, name):
        """Define a estratégia de escalonamento ativa."""
        if name in self.strategies:
            self.current_strategy = self.strategies[name]
        else:
            raise ValueError(f"Estratégia '{name}' desconhecida.")

    def load_config(self, filename="config.txt"):
        """Carrega 'quantum' e 'aging' de um arquivo."""
        try:
            with open(filename, 'r') as f:
                for line in f:
                    if ':' in line:
                        key, value = line.strip().split(':', 1)
                        self.config[key.strip()] = int(value.strip())  #
            
            # Garante valores padrão
            if 'quantum' not in self.config: self.config['quantum'] = 2
            if 'aging' not in self.config: self.config['aging'] = 1

        except FileNotFoundError:
            print(f"Arquivo de configuração '{filename}' não encontrado. Usando padrões (quantum=2, aging=1).", file=sys.stderr)
            self.config = {'quantum': 2, 'aging': 1}  # (valores de exemplo)
        except Exception as e:
            print(f"Erro ao ler config: {e}. Usando padrões.", file=sys.stderr)
            self.config = {'quantum': 2, 'aging': 1}
        
        print(f"Configuração carregada: Quantum={self.config['quantum']}, Aging={self.config['aging']}", file=sys.stderr)

    def load_processes_from_stdin(self):
        """Lê os dados dos processos da entrada padrão (stdin)."""
        print("Digite os processos (instante, duração, prioridade), um por linha.", file=sys.stderr)
        print("Pressione Ctrl+D (Linux/Mac) ou Ctrl+Z+Enter (Windows) para finalizar.", file=sys.stderr)
        pid_counter = 1
        try:
            for line in sys.stdin:  #
                parts = line.strip().split()  #
                if len(parts) == 3:
                    try:
                        t_creation, duration, priority = map(int, parts)  #
                        if duration <= 0:
                             print(f"Ignorando processo com duração inválida (<= 0): {line.strip()}", file=sys.stderr)
                             continue
                        self.processes.append(Process(f"P{pid_counter}", t_creation, duration, priority))
                        pid_counter += 1
                    except ValueError:
                         print(f"Ignorando linha mal formatada (não são inteiros): {line.strip()}", file=sys.stderr)
                elif parts:
                    print(f"Ignorando linha mal formatada (esperava 3 valores): {line.strip()}", file=sys.stderr)
        except EOFError:
            pass
        print(f"Leitura finalizada. {len(self.processes)} processos carregados.", file=sys.stderr)

    def run_all(self):
        """Executa a simulação para todas as estratégias implementadas."""
        self.load_config("config.txt")
        self.load_processes_from_stdin()
        
        if not self.processes:
            print("Nenhum processo válido foi fornecido.", file=sys.stderr)
            return

        print("\n" + "="*40)
        print("Iniciando Simulação de Escalonamento")
        print("="*40)

        for name, strategy in self.strategies.items():
            print(f"\n--- Executando Algoritmo: {name} ---")
            self.current_strategy = strategy
            
            # Cria cópias limpas dos processos para cada simulação
            processes_copy = [p.clone() for p in self.processes]
            
            try:
                avg_tt, avg_wt, context_switches, diagram_str = self.current_strategy.schedule(processes_copy, self.config)
                
                # Imprime os resultados na saída padrão (stdout)
                print(f"Tempo médio de vida (tt): {avg_tt:.2f}")  #
                print(f"Tempo médio de espera (tw): {avg_wt:.2f}")  #
                print(f"Número de trocas de contexto: {context_switches}")  #
                print("Diagrama de tempo:")  #
                print(diagram_str)
            
            except Exception as e:
                print(f"Erro ao executar a estratégia {name}: {e}")
                import traceback
                traceback.print_exc(file=sys.stderr)


# --- Ponto de Entrada do Programa ---
if __name__ == "__main__":
    simulator = SchedulerSimulator()
    simulator.run_all()