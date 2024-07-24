const router = require("express").Router();
const { titleRegx, contentRegx, pwRegx, idRegx, tellRegx, nameRegx } = require("../const/regx");
const CustomError = require("../const/customError");
const connect = require("../../mariadb");

const checkLogin = require("../middleware/chekLogin");
const checkTitle = require("../middleware/checkTitle");
const checkid = require("../middleware/checkid");
const checkpw = require("../middleware/checkpw");
const checktell = require("../middleware/checktell");
const checkname = require("../middleware/checkname");
// --------------------------------로그인-----------------------------------------------------------------------------------

router.post('/login',checkid,checkpw ,(req, res) => {

    const id = req.body.id;
    const pw = req.body.pw;
    res.locals.id=id;
    res.locals.pw=pw;
    
        
        connect.query('SELECT * FROM account WHERE id = ? AND pw = ?;', [id, pw], (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                res.status(404).send({ message: 'ID 또는 PW가 잘못되었습니다' });
                return;
            }
            connect.query('SELECT idx FROM account WHERE id = ? AND pw = ?;', [id, pw], (err, results1) => {
                req.session.userIdx = results1; // 세션에 userId로 저장
                res.status(200).json(req.session.userIdx); // JSON 응답 형식 수정
                console.log(req.session.userIdx)
            });

            
        });

    });

// --------------------------------회원가입-----------------------------------------------------------------------------------

router.post("/",checkid,checkpw,checktell,checkname, (req, res) => {
    const id = req.body.id;
    const pw = req.body.pw;
    const tell = req.body.tell;
    const name = req.body.name;

    try {
        const query = 'SELECT * FROM account WHERE id = ?;';
        const values = [id];

        connect.query(query, values, (err, results) => {
            if (err) {
                console.log(err.message);
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            if (results.length !== 0) {
                res.status(404).send({ message: '이미 존재하는 id 입니다' });
                return;
            }
            const query2 = 'SELECT * FROM account WHERE tell = ?;';
            const values2 = [tell];

            connect.query(query2, values2, (err, results) => {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({ message: 'Database query failed' });
                    return;
                }

                if (results.length !== 0) {
                    res.status(404).send({ message: '이미 존재하는 tell 입니다' });
                    return;
                }
            
                const query1 = 'INSERT INTO account (id, pw, name, tell) VALUES (?, ?, ?, ?);';
                const values1 = [id, pw, name, tell];

                connect.query(query1, values1, (err, results) => {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send({ message: 'Database query failed' });
                        return;
                    }

                    res.status(200).json({ message: 'Account created successfully' });
                });
            })
        });

    } catch (err) {
        console.log(err.stack)
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

// --------------------------------id 찾기-----------------------------------------------------------------------------------

router.get("/id",checkname,checktell, (req, res) => {
    const name = req.body.name;
    const tell = req.body.tell;
    try {
        const query = 'SELECT id FROM account WHERE name = ? AND tell = ?;';
        const values = [name, tell];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                res.status(404).send({ message: 'name 또는 tell이 잘못되었습니다' });
                return;
            }

            res.status(200).json(
                results
            );
           
        });

    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

// --------------------------------pw 찾기-----------------------------------------------------------------------------------

router.get("/pw",checkid,checktell, (req, res) => {
    const id = req.body.id;
    const tell = req.body.tell;
    try {
        const query = 'SELECT pw FROM account WHERE id = ? AND tell = ?;';
        const values = [id, tell];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                res.status(404).send({ message: 'id 또는 tell이 잘못되었습니다' });
                return;
            }

            res.status(200).json(
                results
            );
           
        });


    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

// --------------------------------내정보 보기-----------------------------------------------------------------------------------

router.get("/my",checkLogin, (req, res) => {
    const userIdx = req.session.userId;
    try {
        const query = 'SELECT id,tell,name FROM account WHERE id = ?;';
        const values = [userIdx];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            res.status(200).json(
                results
            );
           
        });


    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

// --------------------------------내정보 수정-----------------------------------------------------------------------------------

router.put("/my",checkLogin,checkpw,checktell,checkname, (req, res) => {
    const pw = req.body.pw;
    const tell = req.body.tell;
    const name = req.body.name;
    const userIdx = req.session.userId;

    try {
        const query = 'UPDATE account SET pw = ? , tell = ? , name = ? WHERE id = ?;';
        const values = [pw,tell,name,userIdx];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            res.status(200).json({
                message: 'success'
            });
           
        });

    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

// --------------------------------회원탈퇴-----------------------------------------------------------------------------------

router.delete("/my",checkLogin, (req, res) => {
    const userIdx = req.session.userId;
    try {
        const query = 'DELETE FROM account WHERE id = ?;';
        const values = [userIdx];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }
            res.status(200).json({
                message: 'success'
            });
           
        });


    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

module.exports = router;

//-----------------------------------------------------------------------------------------------------------------


// 명세서 짜본거 모두다 api 로 변환 그리고 1주차때 해온거 모두다 명세서로 옮기자 api에서 값 받아오는 거 까지 다 선언해주라
// reqest respose 까지 채워서 오기
// postman 이라는 프로그램이 있다 사용방법알아오고 api 테스트까지 해오기
// jsp 에서 세션 했었으니 express session 이 있다 npm 으로 설치함.
// 그거까지 쓸수 있다면 써오기 시간남으면
// jsp 에서 마리아디비 연결할때 명령어 패키지로 하기 maridb 패키지 일듯 npm install mariadb 
