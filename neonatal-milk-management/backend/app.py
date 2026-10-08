"""
Neonatal Milk Management System - Flask Backend
"""

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


@app.route("/api/health", methods=["GET"])
def health_check():
    """API health check endpoint."""
    return jsonify({
        "status": "ok",
        "message": "Neonatal Milk Management System API is running"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
