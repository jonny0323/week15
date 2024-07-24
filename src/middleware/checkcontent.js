const CustomError = require("../const/customError");

const checkcontent = (req, res, next) => {
    const content = req.body.content;  // 수정된 부분
    const contentRegx = /^.{1,500}$/

    console.log(content)
    try {
        if (!content.match(contentRegx)) {
            throw new CustomError("content 값이 이상함", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checkcontent;