const mongodb = require("../const/mongodb")
const jwt = require("jsonwebtoken")

const logging = async (req,res) =>{
    const client = await mongodb()
    


    if (req.decoded && req.decoded.idx) {
        await client.db("web").collection("chatting").insertOne({
            

            "personal_idx" : req.decoded.idx,
            "method" : req.method,
            "input_value" : req.body,
            "output_value" : res.body,
            "status" : res.statusCode,
            "date_time" : new Date()
        })

    }
    else{
        await client.db("web").collection("chatting").insertOne({
            

            "personal_idx" : null,
            "method" : req.method,
            "input_value" : req.body,
            "output_value" : res.body,
            "status" : res.statusCode,
            "date_time" : new Date()
        })
    }

   
}





module.exports = logging 