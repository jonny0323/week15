const router = require("express").Router();
const CustomError = require("../const/customError");
const client = require("../../PostgreSQL.js");
const checkRole = require("../middleware/checkRole.js");
const wrap = require("../const/wrapper.js")


// -------------------------------게시판 카테고리 생성-----------------------------------------------------------------------------------

router.post("/",checkRole, wrap(async(req, res, next) =>  {
    const name = req.body.name;
    const postCategoryResult =  await client.query(
        "SELECT * FROM project.category WHERE name = $1",
        [name]
    )
    const postCategoryRows = postCategoryResult.rows
    if(postCategoryRows.length >= 1){
        return next(new CustomError('이미 존재하는 category name 입니다', 409));
    }
    await client.query(
        "INSERT INTO project.category (name) VALUES ($1)",
        [name]
    )
    res.status(200).json({ message : "success"});
}))
// -------------------------------게시판 카테고리 수정-----------------------------------------------------------------------------------
router.put("/:idx",checkRole, wrap(async(req, res, next) =>  {
    const categoryIdx = req.query.categoryIdx;
    const name = req.body.name;
    await client.query(
        "UPDATE project.category SET name = $1 WHERE idx = $2;",
        [name,categoryIdx]
    )
    res.status(200).json({ message : "success " });
}))

// -------------------------------게시판 카테고리 삭제-----------------------------------------------------------------------------------
router.delete("/:idx",checkRole, wrap(async(req, res, next) =>  {
    const categoryIdx = req.query.categoryIdx;
    await client.query(
        "DELETE FROM project.category WHERE idx = $1;",
        [categoryIdx]
    )
    res.status(200).json({ message : "success " });
}))

module.exports = router;