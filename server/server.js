const express = require("express");
const server = express();
const { db } = require("./db");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { auth } = require("./auth");
const multer = require("multer")

server.use(express.urlencoded());
server.use(express.static("public"));
server.use(cookieParser());
server.use("/home", auth)

const saltRounds = 10;

server.set("view engine", "ejs");

//multer config
const uploads = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb)=> {
        cb(null, `${file.originalname}`)
    }
})
const upload = multer({storage: uploads})

server.get("/", async (req,res) => {
    const books = await db("books")

    res.render("index", {
        db: books
    });
});

server.get("/login", (req, res) => {
    res.render("login")
});

server.get("/signup", (req, res) => {
    res.render("signup")
});

server.get("/home", (req, res) => {
    res.render("dashboard")
});

server.get("/home/book/:id", async (req, res) => {
    const book = await db("books").select().where({id: req.params.id})
    
    res.render("book", {
        books: book
    });

    res.render("book")
})

server.post("/signup", async (req, res) => {
        const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds) 
        await db("user").insert({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
        })
        res.redirect("/login")
});



server.post("/login", async (req, res) => {
    const user = await db("user").select().where({email: req.body.email})
    const comparedPassword = bcrypt.compareSync(req.body.password, user[0].password)

    if(comparedPassword) {
        const token = await jwt.sign(user[0], "bigsecret", {expiresIn: 60 * 60 * 1000 * 24,})
        res.cookie("auth", token, {httpOnly: true, sameSite: "strict", secure: true})
        res.redirect("/home");
        /*res.render("dashboard", {
            user: user[0].name
        })*/
    } else {
        res.redirect("/login")
    }
});

server.post("/home/addbook", upload.single("img"), async (req, res) => {
    console.log(req.file)
    const imgSrc = req.file.path.replace(/\\/g, "/").substring("public".length)
    await db("books").insert({
        name: req.body.name,
        author: req.body.author,
        userid: req.users.id,
        img: imgSrc
    })
    res.redirect("/")
});

server.listen(3000, () => {
    console.log("Connected")
});