const router = require("express").Router();
const CustomError = require("../const/customError.js");
const client = require("../const/PostgreSQL.js");
const checkAdmin = require("../middleware/checkRole.js");
const wrap = require("../const/wrapper.js")
const jwt = require("jsonwebtoken")

// -------------------------------게시판 카테고리 생성-----------------------------------------------------------------------------------
router.post("/",checkAdmin, wrap(async(req, res, next) =>  {
    const name = req.body.name;
    const postCategoryResult =  await client.query(
        "SELECT * FROM project.category WHERE name = $1",
        [name]
    )
    const postCategoryRows = postCategoryResult.rows
    if(postCategoryRows.length >= 1){
         throw new CustomError('이미 존재하는 category name 입니다', 409);
    }
    await client.query(
        "INSERT INTO project.category (name) VALUES ($1)",
        [name]
    )
    res.status(200).json({});
}))
// -------------------------------게시판 카테고리 수정-----------------------------------------------------------------------------------
router.put("/:idx",checkAdmin, wrap(async(req, res, next) =>  {
    const categoryIdx = req.params.idx;
    const name = req.body.name;
    await client.query(
        "UPDATE project.category SET name = $1 WHERE idx = $2;",
        [name,categoryIdx]
    )
    res.status(200).json({});
}))
// -------------------------------게시판 카테고리 삭제-----------------------------------------------------------------------------------
router.delete("/:idx",checkAdmin, wrap(async(req, res, next) =>  {
    const categoryIdx = req.params.idx;
    await client.query(
        "DELETE FROM project.category WHERE idx = $1;",
        [categoryIdx]
    )
    res.status(200).json({});
}))

module.exports = router;