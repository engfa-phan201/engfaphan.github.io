from flask import Flask, render_template, request, jsonify
from database import get_connection, init_db
from datetime import datetime

app = Flask(__name__)
init_db()

# INDEX
@app.route("/")
def index():
    return render_template("profile_engfa_phan.html")

#  COMMENT 
@app.route("/comments")
def get_comments():
    conn = get_connection()
    comments = conn.execute(
        "SELECT id, name, message, timestamp FROM comments ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(c) for c in comments])

# comment
@app.route("/comments/add", methods=["POST"])
def add_comment():
    data = request.get_json()
    name    = data.get("name", "").strip()
    message = data.get("message", "").strip()
    ip      = request.remote_addr

    # Validation
    if not name or not message:
        return jsonify({"error": "Missing information"}), 400
    if len(message) > 500:
        return jsonify({"error": "The message is too long"}), 400

    conn = get_connection()
    conn.execute(
        "INSERT INTO comments (name, message, ip) VALUES (?, ?, ?)",
        (name, message, ip)
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

# PORT 5001 
if __name__ == "__main__":
    app.run(debug=True, port=5001)