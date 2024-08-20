const wrap = asyncFn => {
      return (async (req, res, next) => {
        try {
          return await asyncFn(req, res, next)
        } catch (error) {
          console.log("래퍼실행됨")
          return next(error)
        }
      })  
    }
module.exports = wrap;