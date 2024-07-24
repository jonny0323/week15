const router = require("express").Router()
const { titleRegx, contentRegx } = require("../const/regx")
const CustomError= require("../const/customError");
const checkLogin = require("../middleware/chekLogin");
const checkcontent = require("../middleware/checkcontent");
const checkArticleidxCo = require("../middleware/checkArticleidxCo");
const checkArticleidx = require("../middleware/checkArticleidx");
const pool = require("../../mariadb");
const connect = require("../../mariadb");
const checkCommentIdx = require("../middleware/checkComment");
// --------------------------------댓글 생성하기-----------------------------------------------------------------------------------

router.post("/",checkLogin,checkArticleidxCo,checkcontent, (req, res) => {
    const content = req.body.content;
    const articleIdx = req.body.articleIdx;
    const userIdx = req.session.userId;
    
    try {

        const query = 'INSERT INTO comment (account_id, article_idx, content ) VALUES (?, ?, ?);';
        const values = [userIdx,articleIdx, content];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }
            
            res.status(200).json({ "message": "success" }); // JSON 응답 형식 수정
        });
    
    } catch (err) {
        res.status(err.statusCode || 500).send({ "message": err.message });
    }
});

// --------------------------------댓글 보기-----------------------------------------------------------------------------------

router.get("/:idx", checkArticleidx, (req, res) => {
    const articleIdx = req.params.idx; // boardIdx에서 params.idx로 수정
    const userIdx = req.session.userId;
    try {
        
        const query = 'SELECT * FROM comment WHERE article_idx = ?';
        const values = [articleIdx];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            res.status(200).json({ 
                results
            });
           
        });


    } catch (err) {
        res.status(err.statusCode || 500).send({ "message": err.message });
    }
});

// --------------------------------댓글 수정하기-----------------------------------------------------------------------------------

router.put("/:idx",checkLogin,checkCommentIdx,checkcontent, (req, res) => {
    const content = req.body.content;
    const commentIdx = req.params.idx;
    const userIdx = req.session.userId;
    try {
        const query = 'UPDATE comment SET  content = ? WHERE idx = ?;';
        const values = [content, commentIdx];

        connect.query(query, values, (err, results) => {

            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }

            res.status(200).json({ 
                "message" : "댓글 수정 성공~!"
            });
           
        });
    } catch (err) {
        res.status(err.statusCode || 500).send({ "message": err.message });
    }
});

// --------------------------------댓글 삭제하기-----------------------------------------------------------------------------------

router.delete("/:idx",checkLogin,checkCommentIdx, (req, res) => {
    const commentIdx = req.params.idx;
    const userIdx = req.session.userId;
    try {
        const query = 'DELETE FROM comment WHERE idx = ?;';
        const values = [commentIdx];

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
        res.status(err.statusCode || 500).send({ "message": err.message });
    }
});

// --------------------------------댓글 좋아요하기-----------------------------------------------------------------------------------

router.post("/:idx/like",checkLogin,checkCommentIdx, (req, res) => {
    const commentIdx = req.params.idx;
    const userIdx = req.session.userId;
    try {
        
        
        const query = 'SELECT * FROM comment_like WHERE comment_idx = ? AND account_id = ?;';
        const values = [commentIdx,userIdx];

        connect.query(query, values, (err, results) => {
            console.log(results)
            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }
            if (results.length !== 0) {
                res.status(404).send({ message: '이미 좋아요를 눌렀습니다' });
                return;
            }
            const query1 = 'INSERT INTO comment_like (comment_idx, account_id) VALUES (?, ?);';
            const values1 = [commentIdx,userIdx];
    
            connect.query(query1, values1, (err, results) => {
    
                if (err) {
                    console.log(err.message)
                    res.status(500).send({ message: 'Database query failed' });
                    return;
                }
            });
            
            res.status(200).json({ message: '좋아요가 성공적으로 추가되었습니다.' }); // JSON 응답 형식 수정
        });


    } catch (err) {
        res.status(err.statusCode || 500).send({ "message": err.message });
    }
});

// --------------------------------댓글 좋아요 취소하기-----------------------------------------------------------------------------------

router.delete("/:idx/like",checkLogin,checkCommentIdx, (req, res) => {
    const commentIdx = req.params.idx;
    const userIdx = req.session.userId;
    try {
        
        const query = 'SELECT * FROM comment_like WHERE comment_idx = ? AND account_id = ?;';
        const values = [commentIdx,userIdx];

        connect.query(query, values, (err, results) => {
            console.log(results)
            if (err) {
                console.log(err.message)
                res.status(500).send({ message: 'Database query failed' });
                return;
            }
            if (results.length === 0) {
                res.status(404).send({ message: '이미 좋아요가 취소되었습니다' });
                return;
            }
            const query1 = 'DELETE FROM comment_like WHERE comment_idx = ? AND account_id = ?;';
            const values1= [commentIdx,userIdx];
    
            connect.query(query1, values1, (err, results) => {
    
                if (err) {
                    console.log(err.message)
                    res.status(500).send({ message: 'Database query failed' });
                    return;
                }
    
                
    
                
                
            });
            

            
            res.status(200).json({ message: '좋아요가 성공적으로 취소되었습니다.' }); // JSON 응답 형식 수정
        });












    } catch (err) {
        res.status(err.statusCode || 500).send({ "message": err.message });
    }
});

module.exports = router;


// 명세서 짜본거 모두다 api 로 변환 그리고 1주차때 해온거 모두다 명세서로 옮기자 api에서 값 받아오는 거 까지 다 선언해주라
// reqest respose 까지 채워서 오기
// postman 이라는 프로그램이 있다 사용방법알아오고 api 테스트까지 해오기
// jsp 에서 세션 했었으니 express session 이 있다 npm 으로 설치함.
// 그거까지 쓸수 있다면 써오기 시간남으면
// jsp 에서 마리아디비 연결할때 명령어 패키지로 하기 maridb 패키지 일듯 npm install mariadb 
