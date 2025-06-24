let speed = 0;

class PriorityQueue {
    constructor() {
        this.elements = [];
    }
    enqueue(element, priority) {
        this.elements.push({element, priority});
        this.elements.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
        return this.elements.shift();
    }
    isEmpty() {
        return this.elements.length === 0;
    }
    peek() {
        return this.isEmpty() ? null : this.elements[0];
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetMapWithoutRemovingGraph() {
    // Reset edges: style and tooltips
    for (let key in edges) {
        edges[key].setStyle({color: 'gray', weight: 4});
        edges[key].unbindTooltip(); // Remove any tooltip
    }

    // Reset node markers: remove tooltips
    for (let id in markers) {
        markers[id].unbindTooltip();
    }

    // Reset log
    const logDiv = document.getElementById("log");
    logDiv.innerHTML = "";
    
    // Reset statistics
    document.getElementById('algoName').textContent = '-';
    document.getElementById('iterations').textContent = '0';
    document.getElementById('timeTaken').textContent = '0';
}

function updateSpeedLabel(val) {
    speed = parseInt(val);
    document.getElementById("speedLabel").textContent = `${val}ms`;
}

function logMessage(msg) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += `[${time}] ${msg}<br>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}


function runDijkstra() {
    resetMapWithoutRemovingGraph();
    const start = document.getElementById("startNode").value;
    const end = document.getElementById("endNode").value;
    dijkstra(start, end);
}

function runBellmanFord() {
    resetMapWithoutRemovingGraph();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    bellmanFord(start, end);
}


function runBFS() {
    resetMapWithoutRemovingGraph();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    bfs(start, end);
}

function runDFS() {
    resetMapWithoutRemovingGraph();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    dfs(start, end);
}

function runAStar() {
    resetMapWithoutRemovingGraph();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    aStar(start, end);
}


function runBidirectionalDijkstra() {
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    resetMapWithoutRemovingGraph();
    bidirectionalDijkstra(start, end);
}


function runMaxFlow() {
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    resetMapWithoutRemovingGraph();
    maxFlow(start, end);
}


let algorithmStats = {
    name: "",
    iterations: 0,
    startTime: 0
};

function startAlgorithm(name) {
    algorithmStats = {
        name: name,
        iterations: 0,
        startTime: performance.now()
    };
    document.getElementById('algoName').textContent = name;
}

function incrementIteration() {
    algorithmStats.iterations++;
    document.getElementById('iterations').textContent = algorithmStats.iterations;
}

function endAlgorithm() {
    const elapsed = performance.now() - algorithmStats.startTime;
    document.getElementById('timeTaken').textContent = elapsed.toFixed(2);
}