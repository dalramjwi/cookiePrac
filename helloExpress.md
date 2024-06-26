const express = require("express");
const router = express();
const PORT = 3001;
//?

router
  .route("/test")
  .get((req, res) => {
    res.send("get 처리 구문");
  })
  .post((req, res) => {
    res.send("post 처리 구문");
  });

  ### Request 객체 
  req.app : app객체에 접근할 수 있음. req.app.get('port')와 같이 사용 가능
req.body : body-parser 미들웨어가 만드는 요청의 본문을 해석
req.cookies: cookie-parser 미들웨어가 만드는 요청의 쿠키를 해석한 객체
req.ip : 요청의 ip주소가 담겨있음
req.params : 라우트 매개변수에 대한 정보가 담긴 객체
req.query : 쿼리스트링에 대한 정보가 담긴 객체
req.signedCookies : 서명된 쿠키들은 req.cookies 대신 여기에 담겨있음
req.get(헤더이름) : 헤더의 값을 가져오고 싶을 때 사용

### RESPONSE 객체 
res.app : app객체에 접근할 수 있음
res.cookie(키,값,옵션) : 쿠키를 설정하는 메서드
res.clearCookie(키, 값, 옵션) : 쿠키를 제거하는 메서드
res.end() : 데이터없이 응답을 보냄
res.json(JSON) : JSON 형식의 응답을 보냅니다.
res.redirect(주소) : 리다이렉트할 주소와 함께 응답을 보냅니다
res.render(뷰, 데이터) : 템플릿 엔진을 렌더링해서 응답할 때 사용
res.send(데이터) : 데이터와 함께 응답을 보냄.
res.sendFile(경로) : 경로에 위치한 파일을 응답함
res.set(헤더, 값) 또는 res.setHeader(헤더, 값) : 응답의 헤더를 설정함.
res.status(코드) : 응답 시의 HTTP 상태 코드를 지정