# Neonatal Milk Management System

A comprehensive system for managing neonatal milk inventory, donor records, and distribution in hospital NICUs (Neonatal Intensive Care Units).

## Tech Stack

- **Frontend:** React
- **Backend:** Python Flask (REST API)
- **Database:** MySQL

## Project Structure

```
neonatal-milk-management/
├── frontend/          # React application
├── backend/           # Flask REST API server
├── database/          # SQL schema and migrations
├── tests/             # Test suites
├── README.md
└── .env.example
```

## Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- MySQL (v8.0+)

## Getting Started

### 1. Clone & Configure

```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

The backend API will start at **http://localhost:5000**.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will start at **http://localhost:3000**.

### 4. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint   | Description         |
|--------|------------|---------------------|
| GET    | `/health`  | API health check    |

*More endpoints will be added as features are implemented.*

## License

This project is developed as a B.Tech CSE academic project.
