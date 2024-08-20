const router = require("express").Router()
const { titleRegx, contentRegx,commentRegx, articleRegx} = require("../const/regx")
const CustomError= require("../const/customError");
const checkLogin = require("../middleware/chekLogin");
const checkRegx = require("../middleware/checkRegx");
const client = require("../const/PostgreSQL.js");
const wrap = require("../const/wrapper.js")
const jwt = require("jsonwebtoken")
// --------------------------------댓글 생성하기-----------------------------------------------------------------------------------
router.post("/", checkLogin, checkRegx(["articleIdx", articleRegx]), checkRegx(["content", contentRegx]), wrap(async(req, res, next) => {
    const content = req.body.content;
    const articleIdx = req.body.articleIdx;
    const userIdx = req.decoded.idx;
     await client.query(
        "INSERT INTO project.comment (account_idx, article_idx, content) VALUES ($1,$2,$3);",
        [userIdx, articleIdx, content]
    )
    res.status(200).json({ message: 'comment created successfully'});
}))
// --------------------------------댓글 보기-----------------------------------------------------------------------------------
router.get("/:idx", checkRegx(["idx", articleRegx]), wrap(async(req, res, next) => {
    const articleIdx = req.params.idx;
    const getCommentResult =  await client.query(
        "SELECT * FROM project.comment WHERE article_idx = $1;",
        [articleIdx]
    )
    const getCommentRows = getCommentResult.rows
    res.status(200).json({ getCommentRows });
}))
// --------------------------------댓글 수정하기-----------------------------------------------------------------------------------
router.put("/:idx", checkLogin, checkRegx(["content", contentRegx]), wrap(async(req, res, next) => {
    const content = req.body.content;
    const commentIdx = req.params.idx;
    const putCommentResult =  await client.query(
        "SELECT account_idx FROM project.comment WHERE idx = $1;",
        [commentIdx]
    )      
    const putCommentRows = putCommentResult.rows[0].account_idx;
    console.log(putCommentRows)
    console.log(req.decoded.idx)
    if(putCommentRows != req.decoded.idx){
        return next(new CustomError('권한이 없습니다', 401));
    }
    await client.query(
        "UPDATE project.comment SET content = $1 WHERE idx = $2;",
        [content, commentIdx]
    )
    res.status(200).json({message:  "댓글 수정 성공~!" });
}))
// --------------------------------댓글 삭제하기-----------------------------------------------------------------------------------
router.delete("/:idx", checkLogin, wrap(async(req, res, next) => {
    const commentIdx = req.params.idx;
    const deleteCommentResult =  await client.query(
        "SELECT account_idx FROM project.comment WHERE idx = $1;",
        [commentIdx]
    )
    const deleteCommentRows = deleteCommentResult.rows[0].account_idx;
    console.log(deleteCommentRows)
    console.log(req.decoded.idx)
    if(deleteCommentRows != req.decoded.idx){
        return next(new CustomError('권한이 없습니다', 401));
    }
    await client.query(
        "DELETE FROM project.comment WHERE idx = $1;",
        [commentIdx]
    )
    res.status(200).json({message: "success" });
}))
// --------------------------------댓글 좋아요하기 -----------------------------------------------------------------------------------
router.post("/:idx/like", checkLogin,  wrap(async (req, res, next) => {
    const commentIdx = req.params.idx;
    const userIdx = req.decoded.idx;
    await client.query(
        'BEGIN;',
    )
    const selectResult = await client.query(
        'SELECT * FROM project.comment_like WHERE comment_idx= $1 AND account_idx = $2',
        [commentIdx,userIdx]
    )
    const selectRows = selectResult.rows;
    console.log(selectRows)
    if(selectRows.length>=1){
        await client.query('ROLLBACK')
        return next(new CustomError('이미 좋아요를 눌렀습니다', 409));
    }
    await client.query(
        'INSERT INTO project.comment_like (comment_idx, account_idx) VALUES ($1, $2);',
        [commentIdx,userIdx]
    )
    await client.query(
        'COMMIT;',
    )
    res.status(200).json({});
}))
// --------------------------------댓글 좋아요 취소하기-----------------------------------------------------------------------------------
router.delete("/:idx/like", checkLogin, wrap(async(req, res, next) => {
    const commentIdx = req.params.idx;
    const userIdx = req.decoded.idx;
    await client.query(
        'BEGIN;',
    )
    const selectResult=  await client.query(
        'SELECT * FROM project.comment_like WHERE comment_idx= $1 AND account_idx = $2',
        [commentIdx,userIdx]
    )
    const selectRows = selectResult.rows;
    console.log(selectRows)
    if(selectRows.length<1){
        await client.query('ROLLBACK')
        return next(new CustomError('이미 좋아요가 취소되었습니다', 409));
    }
    await client.query(
        'DELETE FROM project.comment_like WHERE comment_idx = $1 AND account_idx = $2;',
        [commentIdx,userIdx]
    )
    
    await client.query(
        'COMMIT;',
    )
  
    res.status(200).json({});
}))
module.exports = router;