const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const books = require('./db/Books.json')
const cookieParser = require('cookie-parser')
const accessTokenSecret = 'myaccesstoken';
const app = express()
const users = require('./db/users.json')

app.use(cookieParser())
app.set('view engine','pug')
app.set('views','./views')

app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())
const authJWT = (req,res,next)=>{
    //const token = req.headers.authorization ? req.headers.authorization.split(' ')[1]:null;
    const token = req.cookies['jwt']
    if(token){
        jwt.verify(token,accessTokenSecret,(err,user)=>{
            if(err){
                return res.status(403).json({err:'token invalid'});
            }
            req.user = user;
            next();
        });
    }else{
        res.sendStatus(401).json({err:"no token"})
    }
}
app.get('/books',authJWT,(req,res)=>{
    
    res.json({books})
})

app.get('/login',(req,res)=>{
    res.render('login')

})

app.post('/login',(req,res)=>{
    const {username,password} = req.body;
    const user = users.find(u=>u.username===username && u.password ===password)
    console.log()
    console.log(books.map((b)=>{b.title,b.author,b.language}))
    if(user){
        const accessToken = jwt.sign({username:user.username,role:user.role},accessTokenSecret,{expiresIn:30})
        res.cookie('jwt',accessToken,{secure:true,httpOnly:true})

        res.render('books',{books})
    }else{
        res.render('login',{err:"invalid user credential"})
    }
})
app.listen(3000,()=>{
    console.log('Auth service started on port 3000')
})