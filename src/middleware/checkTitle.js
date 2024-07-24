const CustomError = require("../const/customError");

const checkTitle = (req, res, next) => {
    const title = req.body.title;  // 수정된 부분
    const titleRegx = /^.{1,20}$/;

    console.log(title)
    try {
        if (!title.match(titleRegx)) {
            throw new CustomError("title 값이 이상함", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checkTitle;

