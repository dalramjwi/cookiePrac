const http = require("http");
const url = require("url");
const querystring = require("querystring");
const fs = require("fs");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();

// 데이터베이스 설정
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

const sessions = {}; // 세션을 저장할 객체

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === "/") {
    // index.html 파일 제공
    fs.readFile("./cookie.html", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (pathname === "/login" && req.method === "POST") {
    // 로그인 처리
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const { username, password } = querystring.parse(body);

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
              "Set-Cookie": `sessionId=${sessionId}; HttpOnly Max-Age=9`,
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
  } else if (pathname === "/check-login" && req.method === "GET") {
    // 로그인 상태 확인
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
});

// 쿠키 파싱 함수
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
