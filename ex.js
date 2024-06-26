const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      const read = fs.readFileSync("./ex.html", "utf8");
      //res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.write(read);
      res.end();
    }
  } else if (req.method === "POST") {
    if (req.url === "/submit") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const parsedData = new URLSearchParams(body);
        const id = parsedData.get("id");
        const pwd = parsedData.get("pwd");
        const html = `<h1>당신의 아이디 : ${id}</h1><h2>비밀번호 : ${pwd}</h2>`;
        res.write(html);
        res.end();
      });
    }
  }
});
