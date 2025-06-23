import osmnx as ox
import json

# Settings
ox.settings.log_console = True
ox.settings.use_cache = True

GRAPH_TYPE = 'drive'
CENTER = (37.94952, 23.678294)
RADIUS = 2000

def main():
    G = ox.graph_from_point(CENTER, dist=RADIUS, network_type=GRAPH_TYPE, simplify=True)

    # Convert to GeoDataFrames
    nodes, edges = ox.graph_to_gdfs(G)

    # Build node coords
    node_coords = {
        str(node_id): [data.y, data.x]
        for node_id, data in nodes.iterrows()
    }

    # Build edge list with weights
    graph_edges = {}
    for (u, v, key), data in edges.iterrows():
        u, v = str(u), str(v)
        graph_edges.setdefault(u, []).append({
            "node": v,
            "weight": data["length"]
        })
        # Optional reverse edge
        if not G.is_directed():
            graph_edges.setdefault(v, []).append({
                "node": u,
                "weight": data["length"]
            })

    # Save to JSON
    with open("map_graph.json", "w") as f:
        json.dump({"nodes": node_coords, "edges": graph_edges}, f, indent=2)

    print(f"Graph saved with {len(node_coords)} nodes and {sum(len(v) for v in graph_edges.values())} edges")

if __name__ == "__main__":
    main()
