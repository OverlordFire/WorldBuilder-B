from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

DB = "WB_Sql.db"

print("Banco:", os.path.abspath(DB))
def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS Users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    NOT NULL UNIQUE,
            email    TEXT    NOT NULL UNIQUE,
            password TEXT    NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",
            (data["username"], data["email"], generate_password_hash(data["password"]))
        )
        conn.commit()
        print("Usuário salvo!")
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = get_db()
    try:
        user = conn.execute(
            "SELECT * FROM Users WHERE email = ?",
            (data["email"],)
        ).fetchone()

        if user and check_password_hash(user["password"], data["password"]):
            print("Usuário salvo!")
            return jsonify({"success": True, "username": user["username"]})

        return jsonify({"success": False, "message": "E-mail ou senha inválidos"})
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
