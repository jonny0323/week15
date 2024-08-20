const router = require("express").Router();
const { idRegx, pwRegx, tellRegx, nameRegx } = require("../const/regx");
const checkLogin = require("../middleware/chekLogin");
const checkRegx = require("../middleware/checkRegx");
const CustomError = require("../const/customError");
const client = require("../const/PostgreSQL.js");
const wrap = require("../const/wrapper.js")
const jwt = require("jsonwebtoken")
// --------------------------------로그인-----------------------------------------------------------------------------------
router.post('/login', checkRegx(["id", idRegx]), checkRegx(["pw", pwRegx]),wrap(async(req, res, next) => {
    const {id,pw}  = req.body;
    const loginResult =  await client.query(
        "SELECT idx,admin from project.account where id = $1 AND pw = $2;",
        [id,pw]
    )
    const loginRows = loginResult.rows
    if(loginRows.length < 1){
        const error = new CustomError("id 또는 pw가 일치하지 않습니다",404)
        next(error)
    }

    console.log(loginRows[0].idx,loginRows[0].admin)

    const token = jwt.sign({
        "idx" : loginRows[0].idx,
        "role" : loginRows[0].admin
    },process.env.Signature ,{
        "issuer" : "stageus",
        "expiresIn" : "5m"
     })

    res.status(200).send({
        "token" : token
    })


    // req.session.idx = loginRows[0].idx;
    // req.session.admin = loginRows[0].admin;
    // res.status(200).send({ idx: req.session.idx, admin :req.session.admin })
}))
// --------------------------------로그아웃 시도-----------------------------------------------------------------------------------
// router.delete('/logout', checkLogin , wrap(async (req, res, next) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return next(err);
//         }
//         res.clearCookie('connect.sid'); // 세션 ID가 저장된 쿠키의 이름을 사용해야 합니다.
//         res.status(200).send({ message: "로그아웃 되었습니다" });
//     });
// }))

//--------------------------------회원가입-----------------------------------------------------------------------------------

router.post("/", checkRegx(["id", idRegx]), checkRegx(["pw", pwRegx]), checkRegx(["tell", tellRegx]), checkRegx(["name", nameRegx]),wrap(async (req, res, next) => {
    const {id,pw,tell,name,admin} = req.body;
    const checkIdResult = await client.query(
        "SELECT * FROM project.account where id = $1;",
        [id]
    )
    const checkIdRows = checkIdResult.rows
    if(checkIdRows.length >= 1){
        return next(new CustomError('이미 존재하는 id 입니다', 409));
    }
    const checkPwResult = await client.query(
        "SELECT * FROM project.account where tell = $1;",
        [tell]
    )
    const checkPwRows = checkPwResult.rows
    if(checkPwRows.length >= 1){
        return next(new CustomError('이미 존재하는 tell 입니다', 409));
    }
    await client.query(
        "INSERT INTO project.account (id, pw, name, tell,admin) VALUES ($1,$2,$3,$4,$5);",
        [id, pw, name, tell,admin]
    )
    res.status(200).json({message: "회원가입 되었습니다!!"});
}))

// --------------------------------id 찾기-----------------------------------------------------------------------------------

router.get("/id", checkRegx(["name", nameRegx]), checkRegx(["tell", tellRegx]),wrap( async (req, res, next) => {
    const {name,tell} = req.body;
    const findIdResult = await client.query(
        "SELECT id FROM project.account WHERE name = $1 AND tell = $2;",
        [name, tell]
    )
    const findIdRows = findIdResult.rows
    if(findIdRows.length < 1){
        const error = new CustomError("id 또는 pw가 일치하지 않습니다",404)
        throw error
    }
    res.status(200).send(findIdRows[0])
}))

// --------------------------------pw 찾기-----------------------------------------------------------------------------------
router.get("/pw", checkRegx(["id", idRegx]), checkRegx(["tell", tellRegx]), wrap(async (req, res, next) => {
    const {id,tell} = req.body;
    const findPwResult = await client.query(
        "SELECT pw FROM project.account WHERE id = $1 AND tell = $2;",
        [id, tell]
    )
    const findPwRows = findPwResult.rows
    if(findPwRows.length < 1){
        const error = new CustomError("pw가 없습니다",404)
        throw error;
    }
    res.status(200).send(findPwRows[0])
}))

// // --------------------------------내정보 보기-----------------------------------------------------------------------------------

router.get("/my", checkLogin, wrap(async(req, res, next) => {
    const userIdx = req.decoded.idx;
    const myInformationResult = await client.query(
        "SELECT id, tell, name FROM project.account WHERE idx = $1;",
        [userIdx]
    )
    const myInformationRows = myInformationResult.rows
    res.status(200).send(myInformationRows[0])
}))

// --------------------------------내정보 수정-----------------------------------------------------------------------------------

router.put("/my", checkLogin, checkRegx(["pw", pwRegx]), checkRegx(["tell", tellRegx]), checkRegx(["name", nameRegx]), wrap(async(req, res, next) => {
    const {pw,tell,name} = req.body;
    const userIdx = req.decoded.idx;
    await client.query(
        "UPDATE project.account SET pw = $1, tell = $2, name = $3 WHERE idx = $4;",
        [pw, tell, name, userIdx]
    )
    res.status(200).json({ message: 'success' });
}))
// // --------------------------------회원탈퇴-----------------------------------------------------------------------------------

router.delete("/my", checkLogin, wrap(async (req, res, next) => {
    const userIdx = req.decoded.idx;
    await client.query(
        "DELETE FROM project.account WHERE idx = $1;",
        [userIdx]
    )
    res.clearCookie('connect.sid'); // 세션 ID가 저장된 쿠키의 이름을 사용해야 합니다.
    res.status(200).send({ message: "회원탈퇴 되었습니다" })
}))
module.exports = router