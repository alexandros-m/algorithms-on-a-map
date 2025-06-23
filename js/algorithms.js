async function dijkstra(start, end) {
    startAlgorithm("Dijkstra");
    const distances = {};
    const previous = {};
    const queue = new PriorityQueue();

    logMessage(`Starting Dijkstra from ${start} to ${end}`);

    // Initialize distances and queue
    for (const node in nodeCoords) {
        distances[node] = node === start ? 0 : Infinity;
        queue.enqueue(node, distances[node]);
    }

    // Visual START/END labels
    if (markers[start]) {
        markers[start].bindTooltip("START", {
            permanent: true,
            direction: "top",
            className: "start-label"
        }).openTooltip();
    }
    if (markers[end]) {
        markers[end].bindTooltip("END", {
            permanent: true,
            direction: "top",
            className: "end-label"
        }).openTooltip();
    }

    // Main loop
    while (!queue.isEmpty()) {
        incrementIteration();
        const { element: current } = queue.dequeue();

        logMessage(`Visiting node ${current}`);

        // Visualize visited path (blue)
        if (previous[current]) {
            const edgeKey = [previous[current], current].sort().join("-");
            if (edges[edgeKey]) {
                edges[edgeKey].setStyle({ color: "#0172BB", weight: 4 });
            }
            await sleep(speed);
        }

        if (current === end) break;

        const neighbors = graph[current];
        if (!neighbors) continue;

        for (const neighbor of neighbors) {
            incrementIteration();
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                previous[neighbor.node] = current;
                logMessage(`Updating distance to ${neighbor.node} via ${current} = ${alt.toFixed(1)}`);
                queue.enqueue(neighbor.node, alt);
            }
        }
    }

    endAlgorithm();

    // Handle unreachable case
    if (start !== end && !previous[end]) {
        logMessage(`No path found to destination ${end}`);
        return;
    }

    logMessage(`Destination ${end} reached`);

    // Build and animate path
    const path = [];
    let current = end;
    while (current) {
        path.unshift(current);
        current = previous[current];
    }

    logMessage(`Final path: ${path.join(" &rarr; ")}`);

    for (let i = 0; i < path.length - 1; i++) {
        const edgeKey = [path[i], path[i + 1]].sort().join("-");
        if (edges[edgeKey]) {
            edges[edgeKey].setStyle({ color: "#F58237", weight: 6 });
        }
        await sleep(path.length > 50 ? 50 : speed);
    }
}

async function bellmanFord(start, end) {
    startAlgorithm("Bellman-Ford");

    const distances = {};
    const previous = {};
    const nodes = Object.keys(nodeCoords);
    
    logMessage(`Starting Bellman-Ford from ${start} to ${end}`);

    // Initialize distances
    for (const node of nodes) {
        incrementIteration();
        distances[node] = node === start ? 0 : Infinity;
        previous[node] = null;
    }

    // Visual START/END labels
    if (markers[start]) {
        markers[start].bindTooltip("START", {
            permanent: true,
            direction: "top",
            className: "start-label"
        }).openTooltip();
    }
    if (markers[end]) {
        markers[end].bindTooltip("END", {
            permanent: true,
            direction: "top",
            className: "end-label"
        }).openTooltip();
    }

    // Main algorithm - Relax edges repeatedly
    for (let i = 0; i < nodes.length - 1; i++) {
        incrementIteration();
        let updated = false;
        logMessage(`Iteration #${i+1}`);
        
        for (const node of nodes) {
            incrementIteration();
            if (!graph[node] || distances[node] === Infinity) continue;
            
            for (const neighbor of graph[node]) {
                incrementIteration();
                const edgeWeight = neighbor.weight;
                const alt = distances[node] + edgeWeight;
                
                if (alt < distances[neighbor.node]) {
                    logMessage(`Updating ${neighbor.node}: ${distances[neighbor.node]} &rarr; ${alt.toFixed(1)} via ${node}`);
                    distances[neighbor.node] = alt;
                    previous[neighbor.node] = node;
                    updated = true;
                    
                    // Visualize relaxation
                    const edgeKey = [node, neighbor.node].sort().join("-");
                    if (edges[edgeKey]) {
                        edges[edgeKey].setStyle({ color: "#0172BB", weight: 4 });
                        await sleep(speed);
                    }
                }
            }
        }
        
        // Early termination if no updates
        if (!updated) {
            logMessage(`Early termination at iteration ${i+1} (no updates)`);
            break;
        }
    }

    // Check for negative cycles
    for (const node of nodes) {
        incrementIteration();
        if (!graph[node]) continue;
        
        for (const neighbor of graph[node]) {
            incrementIteration();
            const edgeWeight = neighbor.weight;
            if (distances[node] + edgeWeight < distances[neighbor.node]) {
                logMessage("Negative cycle detected! Cannot compute shortest path.", true);
                return;
            }
        }
    }

    endAlgorithm();

    // Handle unreachable case
    if (start !== end && distances[end] === Infinity) {
        logMessage(`No path found to destination ${end}`);
        return;
    }

    logMessage(`Destination ${end} reached with distance ${distances[end].toFixed(1)}`);

    // Build and animate path
    const path = [];
    let current = end;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    logMessage(`Final path: ${path.join(" &rarr; ")}`);

    for (let i = 0; i < path.length - 1; i++) {
        const edgeKey = [path[i], path[i + 1]].sort().join("-");
        if (edges[edgeKey]) {
            edges[edgeKey].setStyle({ color: "#F58237", weight: 6 });
            await sleep(path.length > 50 ? 50 : speed);
        }
    }
}




async function bfs(start, end) {
    startAlgorithm("BFS");

    const queue = [start];
    const visited = new Set([start]);
    const previous = {};
    
    logMessage(`Starting BFS from ${start} to ${end}`);

    // Visual START/END labels
    if (markers[start]) {
        markers[start].bindTooltip("START", {
            permanent: true,
            direction: "top",
            className: "start-label"
        }).openTooltip();
    }
    if (markers[end]) {
        markers[end].bindTooltip("END", {
            permanent: true,
            direction: "top",
            className: "end-label"
        }).openTooltip();
    }

    previous[start] = null;
    let found = false;

    while (queue.length > 0) {
        incrementIteration(); 
        const current = queue.shift();
        logMessage(`Visiting node ${current}`);

        if (current === end) {
            found = true;
            break;
        }

        if (!graph[current]) continue;

        for (const neighbor of graph[current]) {
            incrementIteration(); 
            const neighborNode = neighbor.node;
            if (!visited.has(neighborNode)) {
                visited.add(neighborNode);
                previous[neighborNode] = current;
                queue.push(neighborNode);
                
                // Visualize edge traversal
                const edgeKey = [current, neighborNode].sort().join("-");
                if (edges[edgeKey]) {
                    edges[edgeKey].setStyle({ color: "#0172BB", weight: 4 });
                    await sleep(speed);
                }
            }
        }
    }

    endAlgorithm();

    if (!found) {
        logMessage(`No path found from ${start} to ${end}`);
        return;
    }

    logMessage(`Destination ${end} reached`);

    // Build and animate path
    const path = [];
    let current = end;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    logMessage(`Path found: ${path.join(" &rarr; ")}`);

    for (let i = 0; i < path.length - 1; i++) {
        const edgeKey = [path[i], path[i + 1]].sort().join("-");
        if (edges[edgeKey]) {
            edges[edgeKey].setStyle({ color: "#F58237", weight: 6 });
            await sleep(path.length > 50 ? 50 : speed);
        }
    }
    
}




async function dfs(start, end) {
    startAlgorithm("DFS");
    const stack = [start];
    const visited = new Set([start]);
    const previous = {};
    
    logMessage(`Starting DFS from ${start} to ${end}`);

    // Visual START/END labels
    if (markers[start]) {
        markers[start].bindTooltip("START", {
            permanent: true,
            direction: "top",
            className: "start-label"
        }).openTooltip();
    }
    if (markers[end]) {
        markers[end].bindTooltip("END", {
            permanent: true,
            direction: "top",
            className: "end-label"
        }).openTooltip();
    }

    previous[start] = null;
    let found = false;

    while (stack.length > 0) {
        incrementIteration();

        const current = stack.pop();
        logMessage(`Visiting node ${current}`);

        if (current === end) {
            found = true;
            break;
        }

        if (!graph[current]) continue;

        for (const neighbor of graph[current]) {
            incrementIteration();
            const neighborNode = neighbor.node;
            if (!visited.has(neighborNode)) {
                visited.add(neighborNode);
                previous[neighborNode] = current;
                stack.push(neighborNode);
                
                // Visualize edge traversal
                const edgeKey = [current, neighborNode].sort().join("-");
                if (edges[edgeKey]) {
                    edges[edgeKey].setStyle({ color: "#0172BB", weight: 4 });
                    await sleep(speed);
                }
            }
        }
    }

    endAlgorithm();

    if (!found) {
        logMessage(`No path found from ${start} to ${end}`);
        return;
    }

    logMessage(`Destination ${end} reached`);

    // Build and animate path
    const path = [];
    let current = end;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    logMessage(`Path found: ${path.join(" &rarr; ")}`);

    for (let i = 0; i < path.length - 1; i++) {
        const edgeKey = [path[i], path[i + 1]].sort().join("-");
        if (edges[edgeKey]) {
            edges[edgeKey].setStyle({ color: "#F58237", weight: 6 });
            await sleep(path.length > 50 ? 50 : speed);
        }
    }
}






function haversineDistance(coord1, coord2) {
    if (!coord1 || !coord2) return Infinity;
    const R = 6371e3; // Earth radius in meters
    const lat1 = coord1[0] * Math.PI / 180;
    const lat2 = coord2[0] * Math.PI / 180;
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

async function aStar(start, end) {
    startAlgorithm("A*");
    const openSet = new PriorityQueue();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};
    
    logMessage(`Starting A* from ${start} to ${end}`);

    // Initialize scores
    for (const node in nodeCoords) {
        incrementIteration();
        gScore[node] = node === start ? 0 : Infinity;
        fScore[node] = node === start ? haversineDistance(nodeCoords[start], nodeCoords[end]) : Infinity;
    }

    // Visual START/END labels
    if (markers[start]) {
        markers[start].bindTooltip("START", {
            permanent: true,
            direction: "top",
            className: "start-label"
        }).openTooltip();
    }
    if (markers[end]) {
        markers[end].bindTooltip("END", {
            permanent: true,
            direction: "top",
            className: "end-label"
        }).openTooltip();
    }

    openSet.enqueue(start, fScore[start]);

    while (!openSet.isEmpty()) {
        incrementIteration();
        const { element: current } = openSet.dequeue();

        logMessage(`Visiting node ${current} (fScore: ${fScore[current].toFixed(1)})`);

        // Visualize the path taken to this node
        if (cameFrom[current]) {
            const edgeKey = [cameFrom[current], current].sort().join("-");
            if (edges[edgeKey]) {
                edges[edgeKey].setStyle({ color: "#0172BB", weight: 4 });
                await sleep(speed);
            }
        }

        if (current === end) {
            logMessage(`Destination ${end} reached`);
            
            // Reconstruct path
            const path = [];
            let temp = end;
            while (temp) {
                incrementIteration();
                path.unshift(temp);
                temp = cameFrom[temp];
            }

            logMessage(`Final path: ${path.join(" &rarr; ")}`);
            endAlgorithm();

            // Animate final path
            for (let i = 0; i < path.length - 1; i++) {
                incrementIteration();
                const edgeKey = [path[i], path[i + 1]].sort().join("-");
                if (edges[edgeKey]) {
                    edges[edgeKey].setStyle({ color: "#F58237", weight: 6 });
                    await sleep(path.length > 50 ? 50 : speed);
                }
            }
            return;
        }

        const neighbors = graph[current] || [];
        for (const neighbor of neighbors) {
            incrementIteration();
            const tentativeG = gScore[current] + neighbor.weight;
            
            if (tentativeG < gScore[neighbor.node]) {
                cameFrom[neighbor.node] = current;
                gScore[neighbor.node] = tentativeG;
                fScore[neighbor.node] = tentativeG + haversineDistance(
                    nodeCoords[neighbor.node], 
                    nodeCoords[end]
                );
                
                logMessage(`Updating ${neighbor.node}: g=${tentativeG.toFixed(1)}, f=${fScore[neighbor.node].toFixed(1)} via ${current}`);
                
                // Visualize the edge being considered
                const edgeKey = [current, neighbor.node].sort().join("-");
                if (edges[edgeKey]) {
                    edges[edgeKey].setStyle({ color: "#00AA00", weight: 4 });
                    await sleep(speed);
                }
                
                openSet.enqueue(neighbor.node, fScore[neighbor.node]);
            }
        }
    }
    endAlgorithm();
    logMessage(`No path found from ${start} to ${end}`);
}






async function bidirectionalDijkstra(start, end) {
    startAlgorithm("Bidirectional Dijkstra");
    // Check if start and end are the same
    if (start === end) {
        logMessage("Start and end are the same");
        return;
    }

    // Initialize data structures for forward and backward searches
    const distF = {};
    const prevF = {};
    const distB = {};
    const prevB = {};
    const queueF = new PriorityQueue();
    const queueB = new PriorityQueue();
    
    logMessage(`Starting Bidirectional Dijkstra from ${start} to ${end}`);

    // Initialize distances and queues
    for (const node in nodeCoords) {
        incrementIteration();
        distF[node] = node === start ? 0 : Infinity;
        distB[node] = node === end ? 0 : Infinity;
        prevF[node] = null;
        prevB[node] = null;
        queueF.enqueue(node, distF[node]);
        queueB.enqueue(node, distB[node]);
    }

    // Visual START/END labels
    if (markers[start]) {
        markers[start].bindTooltip("START", {
            permanent: true,
            direction: "top",
            className: "start-label"
        }).openTooltip();
    }
    if (markers[end]) {
        markers[end].bindTooltip("END", {
            permanent: true,
            direction: "top",
            className: "end-label"
        }).openTooltip();
    }

    let meetingNode = null;
    let bestDistance = Infinity;
    const processedF = new Set();
    const processedB = new Set();

    // Main loop
    while (!queueF.isEmpty() && !queueB.isEmpty()) {
        incrementIteration();
        // Forward search
        if (!queueF.isEmpty()) {
            const { element: currentF } = queueF.dequeue();
            processedF.add(currentF);
            
            logMessage(`Forward visiting node ${currentF}`);

            // Visualize visited path (blue)
            if (prevF[currentF]) {
                const edgeKey = [prevF[currentF], currentF].sort().join("-");
                if (edges[edgeKey]) {
                    edges[edgeKey].setStyle({ color: "#0172BB", weight: 4 });
                    await sleep(speed);
                }
            }

            // Check if this node has been processed by backward search
            if (processedB.has(currentF)) {
                const totalDist = distF[currentF] + distB[currentF];
                if (totalDist < bestDistance) {
                    bestDistance = totalDist;
                    meetingNode = currentF;
                    logMessage(`Found meeting node ${meetingNode} with distance ${bestDistance.toFixed(1)}`);
                }
            }

            // Process neighbors for forward search
            if (graph[currentF]) {
                for (const neighbor of graph[currentF]) {
                    const alt = distF[currentF] + neighbor.weight;
                    if (alt < distF[neighbor.node]) {
                        distF[neighbor.node] = alt;
                        prevF[neighbor.node] = currentF;
                        queueF.enqueue(neighbor.node, alt);
                        logMessage(`Forward: updating distance to ${neighbor.node} via ${currentF} = ${alt.toFixed(1)}`);
                    }
                }
            }
        }

        // Backward search
        if (!queueB.isEmpty()) {
            const { element: currentB } = queueB.dequeue();
            processedB.add(currentB);
            
            logMessage(`Backward visiting node ${currentB}`);

            // Visualize visited path (green)
            if (prevB[currentB]) {
                const edgeKey = [prevB[currentB], currentB].sort().join("-");
                if (edges[edgeKey]) {
                    edges[edgeKey].setStyle({ color: "#00AA00", weight: 4 });
                    await sleep(speed);
                }
            }

            // Check if this node has been processed by forward search
            if (processedF.has(currentB)) {
                const totalDist = distF[currentB] + distB[currentB];
                if (totalDist < bestDistance) {
                    bestDistance = totalDist;
                    meetingNode = currentB;
                    logMessage(`Found meeting node ${meetingNode} with distance ${bestDistance.toFixed(1)}`);
                }
            }

            // Process neighbors for backward search
            if (graph[currentB]) {
                for (const neighbor of graph[currentB]) {
                    const alt = distB[currentB] + neighbor.weight;
                    if (alt < distB[neighbor.node]) {
                        distB[neighbor.node] = alt;
                        prevB[neighbor.node] = currentB;
                        queueB.enqueue(neighbor.node, alt);
                        logMessage(`Backward: updating distance to ${neighbor.node} via ${currentB} = ${alt.toFixed(1)}`);
                    }
                }
            }
        }

        // Termination condition
        if (meetingNode && queueF.peek().priority + queueB.peek().priority >= bestDistance) {
            logMessage(`Terminating: best path found at ${meetingNode}`);
            break;
        }
    }
    endAlgorithm();

    // Handle unreachable case
    if (!meetingNode) {
        logMessage("No path found between start and end");
        return;
    }

    logMessage(`Meeting node found: ${meetingNode}`);
    logMessage(`Total distance: ${bestDistance.toFixed(1)}`);

    // Reconstruct paths
    const pathF = [];
    let current = meetingNode;
    while (current !== null) {
        pathF.unshift(current);
        current = prevF[current];
    }

    const pathB = [];
    current = prevB[meetingNode]; // Skip meeting node since it's already in pathF
    while (current !== null) {
        pathB.push(current);
        current = prevB[current];
    }

    const fullPath = [...pathF, ...pathB];
    logMessage(`Final path: ${fullPath.join(" &rarr; ")}`);

    // Animate final path
    for (let i = 0; i < fullPath.length - 1; i++) {
        const edgeKey = [fullPath[i], fullPath[i + 1]].sort().join("-");
        if (edges[edgeKey]) {
            edges[edgeKey].setStyle({ color: "#F58237", weight: 6 });
            await sleep(speed);
        }
    }
}




async function maxFlow(source, sink) {
    startAlgorithm("Edmonds-Karp (Max Flow)");
    if (source === sink) {
        logMessage("Source and sink are the same");
        endAlgorithm();
        return 0;
    }

    logMessage(`Starting Max Flow from ${source} to ${sink}`);

    // Calculate min/max distances for normalization
    let minDist = Infinity;
    let maxDist = -Infinity;
    for (const u in graph) {
        for (const neighbor of graph[u]) {
            minDist = Math.min(minDist, neighbor.weight);
            maxDist = Math.max(maxDist, neighbor.weight);
        }
    }
    const distRange = maxDist - minDist;
    
    // Visual labels
    if (markers[source]) {
        markers[source].bindTooltip("SOURCE", {
            permanent: true,
            direction: "top",
            className: "start-label"
        }).openTooltip();
    }
    if (markers[sink]) {
        markers[sink].bindTooltip("SINK", {
            permanent: true,
            direction: "top",
            className: "end-label"
        }).openTooltip();
    }

    // Initialize residual graph with normalized capacities
    const residual = {};
    const flowMap = {};
    const capacities = {};
    let totalFlow = 0;
    const flowTooltips = []; // Track tooltips for removal

    // Initialize with normalized capacities
    for (const u in graph) {
        residual[u] = {};
        flowMap[u] = {};
        capacities[u] = {};
        
        for (const neighbor of graph[u]) {
            const v = neighbor.node;
            const dist = neighbor.weight;
            
            // Normalize capacity: shorter distance = higher capacity
            const normalized = distRange === 0 ? 100 : 
                10 + 90 * (1 - (dist - minDist) / distRange);
            
            residual[u][v] = normalized;
            residual[v] = residual[v] || {};
            residual[v][u] = residual[v][u] || 0;
            
            flowMap[u][v] = 0;
            flowMap[v] = flowMap[v] || {};
            flowMap[v][u] = 0;
            
            capacities[u][v] = normalized;
        }
    }

    // Main algorithm loop
    while (true) {
        incrementIteration();
        // BFS to find augmenting path
        const parent = {};
        const visited = new Set([source]);
        const queue = [source];
        let foundPath = false;
        
        parent[source] = null;

        while (queue.length > 0 && !foundPath) {
            const u = queue.shift();
            
            // Explore neighbors in residual graph
            for (const v in residual[u]) {
                if (residual[u][v] > 0 && !visited.has(v)) {
                    visited.add(v);
                    parent[v] = u;
                    queue.push(v);
                    
                    if (v === sink) {
                        foundPath = true;
                        break;
                    }
                }
            }
        }

        if (!foundPath) break;

        // Find minimum residual capacity in the path
        let pathFlow = Infinity;
        let current = sink;
        const pathNodes = [sink];
        
        while (current !== source) {
            const prev = parent[current];
            pathFlow = Math.min(pathFlow, residual[prev][current]);
            current = prev;
            pathNodes.unshift(current);
        }

        // Update residual capacities and flows
        current = sink;
        while (current !== source) {
            const prev = parent[current];
            
            residual[prev][current] -= pathFlow;
            flowMap[prev][current] += pathFlow;
            residual[current][prev] = (residual[current][prev] || 0) + pathFlow;
            
            // Visualize the augmenting path
            const edgeKey = [prev, current].sort().join("-");
            if (edges[edgeKey]) {
                edges[edgeKey].setStyle({ color: "#FF00FF", weight: 6 });
                await sleep(speed);
            }
            
            current = prev;
        }

        totalFlow += pathFlow;
        logMessage(`Augmenting path: ${pathNodes.join(" &rarr; ")} with flow ${pathFlow.toFixed(2)}`);
    }

    // Final visualization of flow values with micro tooltips
    for (const u in flowMap) {
        for (const v in flowMap[u]) {
            if (flowMap[u][v] > 0) {
                const edgeKey = [u, v].sort().join("-");
                if (edges[edgeKey]) {
                    edges[edgeKey].setStyle({ color: "#F58237", weight: 4 });
                    
                    // Create micro tooltip
                    const tooltip = L.tooltip({
                        permanent: true,
                        direction: 'center',
                        className: 'micro-tooltip'
                    }).setContent(
                        `${flowMap[u][v].toFixed(2)}/${capacities[u][v].toFixed(2)}`
                    );
                    
                    edges[edgeKey].bindTooltip(tooltip).openTooltip();
                    flowTooltips.push(tooltip); // Track for removal
                }
            }
        }
    }

    logMessage(`Maximum flow: ${totalFlow.toFixed(2)}`);
    endAlgorithm();
    return totalFlow;
}