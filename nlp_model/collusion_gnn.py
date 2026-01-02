# collusion_gnn.py
# Minimal, hackathon-ready GNN for procurement collusion detection

import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv
from sklearn.cluster import KMeans
import json

# -------------------------------------------------
# 1. SAMPLE INPUT (this comes from Backend JSON)
# -------------------------------------------------
input_json = {
    "companies": [
        {"id": "C001", "director": "Rajesh", "address": "Delhi"},
        {"id": "C002", "director": "Rajesh", "address": "Delhi"},
        {"id": "C003", "director": "Amit", "address": "Mumbai"}
    ],
    "bids": [
        {"company": "C001", "tender": "T1", "amount": 24800000},
        {"company": "C002", "tender": "T1", "amount": 24900000},
        {"company": "C003", "tender": "T1", "amount": 41000000}
    ]
}

# -------------------------------------------------
# 2. FEATURE ENGINEERING (rule-based, explainable)
# -------------------------------------------------
# Features:
# [shared_director, shared_address]

companies = input_json["companies"]

features = []
company_index = {}

for i, c in enumerate(companies):
    company_index[c["id"]] = i

for c in companies:
    shared_director = sum(
        1 for x in companies if x["director"] == c["director"]
    ) > 1
    shared_address = sum(
        1 for x in companies if x["address"] == c["address"]
    ) > 1

    features.append([
        int(shared_director),
        int(shared_address)
    ])

x = torch.tensor(features, dtype=torch.float)

# -------------------------------------------------
# 3. BUILD EDGES (shared director / address)
# -------------------------------------------------
edges = []

for i in range(len(companies)):
    for j in range(len(companies)):
        if i != j:
            if (
                companies[i]["director"] == companies[j]["director"]
                or companies[i]["address"] == companies[j]["address"]
            ):
                edges.append([i, j])

edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()

data = Data(x=x, edge_index=edge_index)

# -------------------------------------------------
# 4. GNN MODEL
# -------------------------------------------------
class CollusionGNN(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = GCNConv(2, 8)
        self.conv2 = GCNConv(8, 1)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        return torch.sigmoid(x)

model = CollusionGNN()

# -------------------------------------------------
# 5. (OPTIONAL) TRAINING WITH DUMMY LABELS
# -------------------------------------------------
# 1 = collusive, 0 = normal (demo only)
labels = torch.tensor([[1], [1], [0]], dtype=torch.float)
data.y = labels

optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
loss_fn = torch.nn.BCELoss()

for epoch in range(200):
    optimizer.zero_grad()
    out = model(data)
    loss = loss_fn(out, data.y)
    loss.backward()
    optimizer.step()

# -------------------------------------------------
# 6. INFERENCE
# -------------------------------------------------
model.eval()
with torch.no_grad():
    scores = model(data).numpy().flatten()

# -------------------------------------------------
# 7. CLUSTERING (collusion groups)
# -------------------------------------------------
kmeans = KMeans(n_clusters=2, random_state=42)
clusters = kmeans.fit_predict(x.numpy())

# -------------------------------------------------
# 8. FINAL OUTPUT (what backend expects)
# -------------------------------------------------
output = []

for i, c in enumerate(companies):
    output.append({
        "company_id": c["id"],
        "collusion_risk": round(float(scores[i]), 3),
        "cluster_id": int(clusters[i]),
        "reasons": [
            "Shared director" if x[i][0] == 1 else None,
            "Same address" if x[i][1] == 1 else None
        ]
    })

# clean None values
for o in output:
    o["reasons"] = [r for r in o["reasons"] if r]

print(json.dumps(output, indent=2))
