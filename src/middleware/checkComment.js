const CustomError = require("../const/customError");

const checkCommentIdx = (req, res, next) => {
    const CommentIdx = req.params.idx;
    console.log(CommentIdx)
    try {
        if (!CommentIdx) {
            throw new CustomError("댓글을 찾을 수 없습니다", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checkCommentIdx;   