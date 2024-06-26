const http = require('http');
const fs = require('fs');

const server = http.createServer((req,res)=>{
    if(req.method === "GET") {
        if(req.url==='/'){
            const read = fs.readFileSync("./ex.html","utf8");
            //res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.statusCode=200;
            res.setHeader ('Content-Type','text/html; charset=utf-8');
            res.write(read)
            res.end()
        }
    }
    else if(req.method === "POST") {
      if()
    }
})

