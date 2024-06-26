const http = require("http");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const querystring = require("querystring");
const crypto = require("crypto");

// 데이터베이스 초기화
const db = new sqlite3.Database("./database.db");
// 데이터베이스 초기화
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)",
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      }
    }
  );
  db.run(
    "INSERT OR IGNORE INTO users (username, password) VALUES ('user1', 'password1')",
    (err) => {
      if (err) {
        console.error("Error inserting initial data:", err.message);
      }
    }
  );
});

const sessions = {};

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      const read = fs.readFileSync("./ex.html", "utf8");
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.write(read);
      res.end();
    } else if (req.url === "/check-login") {
      const cookies = parseCookies(req);
      const sessionId = cookies.sessionId;
      const username = sessions[sessionId];

      if (username) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ loggedIn: true, username }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ loggedIn: false }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  } else if (req.method === "POST") {
    if (req.url === "/login") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const { username, password } = querystring.parse(body);

        console.log(
          `Received login attempt for username: ${username}, password: ${password}`
        ); // 디버깅 메시지 추가

        db.get(
          "SELECT * FROM users WHERE username = ? AND password = ?",
          [username, password],
          (err, row) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error");
            } else if (row) {
              const sessionId = crypto.randomBytes(16).toString("hex");
              sessions[sessionId] = username; // 세션 저장
              res.writeHead(200, {
                "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Max-Age=900`,
                "Content-Type": "text/plain",
              });
              res.end("Login successful");
            } else {
              res.writeHead(401, { "Content-Type": "text/plain" });
              res.end("Login failed");
            }
          }
        );
      });
    }
  }
});

function parseCookies(request) {
  const list = {};
  const rc = request.headers.cookie;

  rc &&
    rc.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });

  return list;
}

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
