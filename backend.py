from flask import Flask, request, jsonify, render_template
import osmnx as ox
import json

app = Flask(__name__, static_folder='static', template_folder='templates')

def build_graph(center, radius, graph_type):
    # This call fetches the graph from OpenStreetMap
    G = ox.graph_from_point(center, dist=radius, network_type=graph_type, simplify=True)
    nodes, edges = ox.graph_to_gdfs(G)
    
    # Convert node data to a simple dictionary
    node_coords = {
        str(node_id): [data.y, data.x]
        for node_id, data in nodes.iterrows()
    }
    
    # Convert edge data to an adjacency list format
    graph_edges = {}
    for (u, v, key), data in edges.iterrows():
        u, v = str(u), str(v)
        graph_edges.setdefault(u, []).append({
            "node": v,
            "weight": data["length"]
        })
        # For undirected graphs, osmnx creates two-way edges.
        # We explicitly add the reverse edge to ensure bidirectionality in our structure.
        if not G.is_directed():
            graph_edges.setdefault(v, []).append({
                "node": u,
                "weight": data["length"]
            })
            
    # Return nodes, edges, and a flag indicating if the graph is directed
    return {"nodes": node_coords, "edges": graph_edges, "is_directed": G.is_directed()}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create_graph', methods=['POST'])
def create_graph():
    try:
        data = request.json
        center = tuple(data['center'])
        radius = data['radius']
        graph_type = data['graph_type']
        
        result = build_graph(center, radius, graph_type)
        
        return jsonify(result)
    except Exception as e:
        print(f"Error creating graph: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


if __name__ == '__main__':
    app.run(debug=True)