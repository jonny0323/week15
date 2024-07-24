const router = require("express").Router();
const { titleRegx, contentRegx } = require("../const/regx");
const CustomError= require("../const/customError");
const checkLogin = require("../middleware/chekLogin");
const checkRole = require("../middleware/checkRole");
const checkTitle = require("../middleware/checkTitle");
const checkcontent = require("../middleware/checkcontent");
const checkArticleidx = require("../middleware/checkArticleidx");
const pool = require("../../mariadb");
const connect = require("../../mariadb")

// --------------------------------게시판 생성하기-----------------------------------------------------------------------------------

router.post("/", checkLogin,checkTitle,checkcontent, (req, res) => {
    const userIdx = req.session.userId;
    const title = req.body.title;
    const content = req.body.content;
    const categoryIdx = req.body.categoryIdx;

    try {
        const query = 'INSERT INTO article (account_id , title, content, category_idx) VALUES (?, ?, ?, ?);';
        const values = [userIdx, title, content, categoryIdx];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }
            res.status(200).json(); // JSON 응답 형식 수정
        });

    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

// --------------------------------게시판 보기-----------------------------------------------------------------------------------

router.get("/:idx/detail",checkArticleidx, (req, res) => {
    const articleIdx = req.params.idx;
    const userIdx = req.session.userId;

    try {
        const query = 'SELECT * FROM article WHERE idx = ?;';
        const values = [articleIdx];

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

// --------------------------------게시판 수정하기-----------------------------------------------------------------------------------

router.put("/:idx",checkLogin,checkArticleidx,checkTitle,checkcontent, (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const articleIdx = req.params.idx;
    const userIdx = req.session.userId;
    const categoryIdx = req.body.categoryIdx;

    try {
        const query = 'UPDATE article SET title = ? , content = ? , category_idx = ? WHERE idx = ?;';
        const values = [title, content , categoryIdx, articleIdx];

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

// --------------------------------게시판 삭제하기-----------------------------------------------------------------------------------

router.delete("/:idx/detail",checkLogin,checkArticleidx, (req, res) => {
    const articleIdx = req.params.idx;
    const userIdx = req.session.userId;

    try {
        const query = 'DELETE FROM article WHERE idx = ?;';
        const values = [articleIdx];

        console.log(articleIdx)
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

// -------------------------------카테고리 보기-----------------------------------------------------------------------------------

router.get("/list", (req, res) => {
    const categoryIdx = req.query.categoryIdx;
    const userIdx = req.session.userId;

    try {
        const query = 'SELECT * FROM article WHERE category_idx = ?;';
        const values = [categoryIdx];

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

// -------------------------------게시글 좋아요 누르기-----------------------------------------------------------------------------------

router.post("/:idx/like", checkLogin ,checkArticleidx, (req, res) => {
    const articleIdx = req.params.idx;
    const userIdx = req.session.userId;

    try {
        const query = 'SELECT * FROM article_like WHERE article_idx = ? AND account_id = ? ;';
        const values = [articleIdx,userIdx];

        console.log(articleIdx)
        console.log(userIdx)
        connect.query(query, values, (err, results) => {
            
            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }
            if (results.length !== 0) {
                res.status(404).send({ message: '이미 좋아요를 눌렀습니다' });
                return;
            }

            const query2 = 'INSERT INTO article_like (article_idx, account_id) VALUES (?, ?);';
            const values2 = [articleIdx,userIdx];

            connect.query(query2, values2, (err, results) => {

                if (err) {
                    console.log(err.message)
                    res.status(500).send({ message: 'Database query failed' });
                    return;
                }

                
                res.status(200).json({ message: '좋아요가 성공적으로 추가되었습니다.' }); // JSON 응답 형식 수정
            });
            
            
        });

    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

// -------------------------------게시글 좋아요 취소하기-----------------------------------------------------------------------------------

router.delete("/:idx/like",checkLogin, checkArticleidx,(req, res) => {
    const articleIdx = req.params.idx;
    const userIdx = req.session.userId;

    try {
        const query = 'SELECT * FROM article_like WHERE article_idx = ? AND account_id = ?;';
        const values = [articleIdx,userIdx];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            if (results.length === 0) {
                res.status(404).send({ message: '이미 좋아요가 취소되어져있습니다' });
                return;
            }

            const query = 'DELETE FROM article_like WHERE article_idx = ? AND account_id = ?;';
            const values = [articleIdx,userIdx];

            connect.query(query, values, (err, results) => {

                if (err) {
                    console.log(err.message)
                    res.status(500).send({ message: 'Database query failed' });
                    return;
                }

                res.status(200).json({ message: '좋아요가 성공적으로 취소되었습니다.' }); // JSON 응답 형식 수정
            });
             // JSON 응답 형식 수정
        });

    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
});

module.exports = router;


// 명세서 짜본거 모두다 api 로 변환 그리고 1주차때 해온거 모두다 명세서로 옮기자 api에서 값 받아오는 거 까지 다 선언해주라
// reqest respose 까지 채워서 오기
// postman 이라는 프로그램이 있다 사용방법알아오고 api 테스트까지 해오기
// jsp 에서 세션 했었으니 express session 이 있다 npm 으로 설치함.
// 그거까지 쓸수 있다면 써오기 시간남으면
// jsp 에서 마리아디비 연결할때 명령어 패키지로 하기 maridb 패키지 일듯 npm install mariadb 
