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
    for table in ["Stories", "Characters", "Locations", "Objects"]:
        conn.execute(f"""
            CREATE TABLE IF NOT EXISTS {table} (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                name    TEXT    NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            )
        """)
    for col in ["description", "obj_type", "element", "rarity", "status"]:
        try:
            conn.execute(f"ALTER TABLE Objects ADD COLUMN {col} TEXT DEFAULT ''")
        except Exception:
            pass
    for col, default in [("story_role", ""), ("character_class", ""), ("age", ""), ("race", ""), ("gender", "N/A"), ("description", "")]:
        try:
            conn.execute(f"ALTER TABLE Characters ADD COLUMN {col} TEXT DEFAULT '{default}'")
        except Exception:
            pass
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
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"success": False, "message": "E-mail e senha são obrigatórios"})
    conn = get_db()
    try:
        user = conn.execute(
            "SELECT * FROM Users WHERE email = ?",
            (data["email"],)
        ).fetchone()
        print("Usuário salvo!")
        if user and check_password_hash(user["password"], data["password"]):
            return jsonify({
                "success": True,
                "user_id": user["id"],
                "username": user["username"],
                "email": user["email"]
            })
        return jsonify({"success": False, "message": "E-mail ou senha inválidos"})
    finally:
        conn.close()

@app.route("/get-items", methods=["GET"])
def get_items():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "Not logged in"})
    conn = get_db()
    try:
        result = {}
        for table in ["Stories", "Characters", "Locations", "Objects"]:
            rows = conn.execute(
                f"SELECT id, name FROM {table} WHERE user_id = ? ORDER BY id ASC",
                (user_id,)
            ).fetchall()
            result[table] = [{"id": row["id"], "name": row["name"]} for row in rows]
        return jsonify({"success": True, "items": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()

@app.route("/create-item", methods=["POST"])
def create_item():
    data = request.json
    section  = data.get("section", "")
    name     = data.get("name", "").strip()
    user_id  = data.get("user_id")

    allowed = ["Stories", "Characters", "Locations", "Objects"]
    if section not in allowed:
        return jsonify({"success": False, "error": "Invalid section"})
    if not name:
        return jsonify({"success": False, "error": "Name is required"})
    if not user_id:
        return jsonify({"success": False, "error": "Not logged in"})
    conn = get_db()
    try:
        cursor = conn.execute(
            f"INSERT INTO {section} (name, user_id) VALUES (?, ?)",
            (name, user_id)
        )
        conn.commit()
        return jsonify({"success": True, "id": cursor.lastrowid, "name": name})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()
@app.route("/get-item", methods=["GET"])
def get_item():
    section = request.args.get("section", "")
    item_id = request.args.get("id")
    user_id = request.args.get("user_id")
    allowed = ["Stories", "Characters", "Locations", "Objects"]
    if section not in allowed or not item_id or not user_id:
        return jsonify({"success": False, "error": "Invalid request"})
    conn = get_db()
    try:
        row = conn.execute(
            f"SELECT * FROM {section} WHERE id = ? AND user_id = ?",
            (item_id, user_id)
        ).fetchone()
        if not row:
            return jsonify({"success": False, "error": "Not found"})
        item = dict(row)
        return jsonify({"success": True, "item": item})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()

@app.route("/update-character", methods=["PUT"])
def update_character():
    data = request.json
    item_id        = data.get("id")
    user_id        = data.get("user_id")
    story_role     = data.get("story_role", "")
    character_class = data.get("character_class", "")
    gender         = data.get("gender", "")
    race           = data.get("race", "")
    description    = data.get("description", "")
    if not item_id or not user_id:
        return jsonify({"success": False, "error": "Missing data"})
    conn = get_db()
    try:
        conn.execute(
            "UPDATE Characters SET story_role = ?, character_class = ?, gender = ?, race = ?, description = ? WHERE id = ? AND user_id = ?",
            (story_role, character_class, gender, race, description, item_id, user_id)
        )
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()
        
@app.route("/delete-item", methods=["DELETE"])
def delete_item():
    data = request.json
    section = data.get("section", "")
    item_id = data.get("id")
    user_id = data.get("user_id")

    allowed = ["Stories", "Characters", "Locations", "Objects"]
    if section not in allowed:
        return jsonify({"success": False, "error": "Invalid section"})
    if not item_id or not user_id:
        return jsonify({"success": False, "error": "Missing data"})
    conn = get_db()
    try:
        conn.execute(
            f"DELETE FROM {section} WHERE id = ? AND user_id = ?",
            (item_id, user_id)
        )
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()

@app.route("/rename-item", methods=["PUT"])
def rename_item():
    data = request.json
    section = data.get("section", "")
    item_id = data.get("id")
    user_id = data.get("user_id")
    new_name = (data.get("name") or "").strip()
    allowed = ["Stories", "Characters", "Locations", "Objects"]
    if section not in allowed:
        return jsonify({"success": False, "error": "Invalid section"})
    if not item_id or not user_id or not new_name:
        return jsonify({"success": False, "error": "Missing data"})
    conn = get_db()
    try:
        conn.execute(
            f"UPDATE {section} SET name = ? WHERE id = ? AND user_id = ?",
            (new_name, item_id, user_id)
        )
        conn.commit()
        return jsonify({"success": True, "name": new_name})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()
        

@app.route("/update-object", methods=["PUT"])
def update_object():
    data = request.json
    item_id     = data.get("id")
    user_id     = data.get("user_id")
    description = data.get("description", "")
    obj_type    = data.get("obj_type", "")
    element     = data.get("element", "")
    rarity      = data.get("rarity", "")
    status      = data.get("status", "")
    if not item_id or not user_id:
        return jsonify({"success": False, "error": "Missing data"})
    conn = get_db()
    try:
        conn.execute(
            "UPDATE Objects SET description = ?, obj_type = ?, element = ?, rarity = ?, status = ? WHERE id = ? AND user_id = ?",
            (description, obj_type, element, rarity, status, item_id, user_id)
        )
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
