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

function resetMap() {
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
    logDiv.innerHTML = "<strong>Log:</strong><br>";
    
    // Reset statistics
    resetStats();
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
    resetMap();
    const start = document.getElementById("startNode").value;
    const end = document.getElementById("endNode").value;
    dijkstra(start, end);
}

function runBellmanFord() {
    resetMap();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    bellmanFord(start, end);
}


function runBFS() {
    resetMap();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    bfs(start, end);
}

function runDFS() {
    resetMap();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    dfs(start, end);
}

function runAStar() {
    resetMap();
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    aStar(start, end);
}


function runBidirectionalDijkstra() {
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    resetMap();
    bidirectionalDijkstra(start, end);
}


function runMaxFlow() {
    const start = document.getElementById('startNode').value;
    const end = document.getElementById('endNode').value;
    resetMap();
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

function resetStats() {
    document.getElementById('algoName').textContent = '-';
    document.getElementById('iterations').textContent = '0';
    document.getElementById('timeTaken').textContent = '0';
}