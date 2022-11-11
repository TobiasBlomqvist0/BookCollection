const jwt = require("jsonwebtoken")

async function auth(req, res, next){
    let token = await req.cookies.auth
    if(token){
        try {
            let decodedToken = jwt.verify(token, 'bigsecret')
            req["users"] = decodedToken
            //console.log(req.users);
            next()
        } catch (error) {
        console.log(error);
        res.redirect('/login')
        }   
    }else {
        res.redirect('/login')
    }
}

//exports.auth = auth
module.exports = { auth }