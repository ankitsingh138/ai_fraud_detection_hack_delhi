# AI Fraud Detection System

A full-stack application for detecting fraud patterns in government tender procurement using graph analysis, NLP, and network visualization.

---

## Quick Start

### Prerequisites
- Node.js 18+ (`nvm install 18 && nvm use 18`)
- Python 3.10+
- Docker (for Neo4j)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup Environment

```bash
git clone <repo-url>
cd ai_fraud_detection_hack_delhi
```

### 2. Start Neo4j (Docker)

```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/neo4j_fraud_db \
  neo4j:latest
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env  # Add your MONGO_URI
npm install
npm run seed          # Populate database with sample data
npm start             # Runs on http://localhost:3010
```

### 4. NLP Model Setup

```bash
cd nlp_model
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm start             # Runs on http://localhost:3000
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────────────┐   │
│  │Government │  │  Company  │  │        Authority          │   │
│  │  Portal   │  │  Portal   │  │  (Fraud Detection)        │   │
│  └─────┬─────┘  └─────┬─────┘  └─────────────┬─────────────┘   │
└────────┼──────────────┼───────────────────────┼─────────────────┘
         │              │                       │
         ▼              ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Tenders  │  │   Bids   │  │  Fraud   │  │   Graph      │    │
│  │   API    │  │   API    │  │   API    │  │   API        │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
└───────┼─────────────┼─────────────┼───────────────┼─────────────┘
        │             │             │               │
        ▼             ▼             ▼               ▼
┌───────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   MongoDB     │  │     NLP Model       │  │      Neo4j          │
│  (Documents)  │  │  (Legal-BERT)       │  │  (Graph Database)   │
└───────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## Components

### Frontend (`/frontend`)

| Portal | Purpose |
|--------|---------|
| **Government** | Publish new tenders with specifications |
| **Company** | View active tenders, submit bids |
| **Authority** | Fraud detection dashboard with 5 analysis types |

**Key Features:**
- Interactive network graphs with zoom/pan/filter
- Real-time fraud detection visualization
- Responsive dark/light theme

### Backend (`/backend`)

| Endpoint | Description |
|----------|-------------|
| `POST /api/tenders` | Create new tender |
| `GET /api/tenders` | List tenders (filter by status) |
| `POST /api/bids` | Submit bid for tender |
| `GET /api/fraud/address-collusion` | Companies at same address |
| `GET /api/fraud/ip-collusion` | Bids from same IP |
| `GET /api/fraud/shared-ownership` | Cross-company ownership |
| `GET /api/fraud/financial-ties` | Shared bank accounts/tax IDs |
| `POST /api/fraud/analyze-tenders` | Run NLP analysis |
| `GET /api/fraud/tailored-clauses` | High-risk tender clauses |
| `POST /api/neo4j/build` | Rebuild graph database |

### NLP Model (`/nlp_model`)

Uses **Legal-BERT** to detect restrictive tender clauses designed to favor specific vendors.

**Flagged patterns:**
- Geographic restrictions ("within 5km radius")
- Specific technology requirements ("SpecificModel-X")
- Unreasonable experience requirements ("12.5 years in tribal belts")

**Risk Score:** 0.0 - 1.0 (>0.8 = high risk)

### Data Layer

| Database | Purpose |
|----------|---------|
| **MongoDB** | Stores tenders, bids, companies, specifications |
| **Neo4j** | Graph relationships for collusion detection |

---

## Fraud Detection Types

### 1. Address Collusion
Multiple companies registered at the same address - suggests shell companies.

### 2. IP Collusion  
Multiple bids submitted from the same IP address - indicates coordinated bidding.

### 3. Shared Ownership
Individuals owning stakes in multiple bidding companies - conflict of interest.

### 4. Tailored Clauses
NLP-detected restrictive specifications designed to exclude competitors.

### 5. Financial Ties
Companies sharing bank accounts, tax IDs, or EMD accounts - hidden relationships.

---

## Data Flow

```
Government Portal                    Company Portal
      │                                    │
      ▼                                    ▼
  [Publish Tender]                   [Submit Bid]
      │                                    │
      ▼                                    ▼
  MongoDB ◄──────────────────────────► MongoDB
      │                                    │
      └────────────┬───────────────────────┘
                   │
                   ▼
            [Sync to Neo4j]
                   │
      ┌────────────┴────────────┐
      ▼                         ▼
  Graph Queries            NLP Analysis
      │                         │
      └────────────┬────────────┘
                   │
                   ▼
           Authority Dashboard
         (Fraud Visualizations)
```

---

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fraud_detection
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j_fraud_db
PORT=3010
```

---

## API Examples

**Create Tender:**
```bash
curl -X POST http://localhost:3010/api/tenders \
  -H "Content-Type: application/json" \
  -d '{"deptName":"PWD","title":"Road Construction","location":"Mumbai","pincode":"400001","estValueInCr":50}'
```

**Run NLP Analysis:**
```bash
curl -X POST http://localhost:3010/api/fraud/analyze-tenders
```

**Get High-Risk Tenders:**
```bash
curl http://localhost:3010/api/fraud/tailored-clauses?threshold=0.8
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TailwindCSS, SVG Graphs |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose), Neo4j |
| NLP | Python, Transformers, Legal-BERT |
| Containerization | Docker (Neo4j) |

---

## Development

```bash
# Run all services
# Terminal 1: Neo4j
docker start neo4j

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend  
cd frontend && npm start
```

---

## License

MIT
