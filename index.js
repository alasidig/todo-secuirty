const templateEngin = require('nunjucks')
const express = require('express')
const cookieParser =  require('cookie-parser')
const {body, validationResult} = require('express-validator');
const escapeHtml = require('escape-html')
const bcrypt = require('bcrypt')
const session = require('express-session')
const {getAllTasks, addTask, getUserByUsername, createUser} = require("./todo_model");
const app = express()
// Populates req.session
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'a very strong secret'
}));
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
templateEngin.configure('views', {
    express: app,
autoescape: false
});
const isLoggedIn = (req,res,next)=>{
    if(!req.session?.username){
        return res.redirect(`/login`)
    }
    next()
}
app.route("/")
    .get( isLoggedIn, async (req, res) => {
        const author = req.cookies.author??''
        const rawTasks = await getAllTasks()
        const tasks = rawTasks.map((task)=>{
            return {
                id:task.id,
                user:escapeHtml(task.user),
                content:escapeHtml(task.content)
            }
        })
        res.render('list.html', {tasks,author, name:req.session.username})
    })
    .post(body('content', 'task title required').trim().isLength({min: 1}).escape(),
        async (req,res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array())
                res.render('list.html',{errors:errors.array(), tasks: await getAllTasks()})
                return }
            const author = req.body.user
            res.cookie('author',author,{ expires:new Date(Date.now() + 60*60*1000*24*7)})
            console.log(req.body)
            await addTask(req.body)
        res.redirect('/')
    })
app.route('/login')
    .get((req, res,) => {
        res.render('auth.njk', {mode: 'login'})
    })
    .post(body("username", "Username must be at least 3 characters")
            .trim()
            .isLength({min: 3})
            .escape()
            .toLowerCase(),
        body("password", "password is required").isLength({min: 1})
        , async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('validation errors: ', errors.array())
                return  res.render('auth.njk', {
                    username: req.body.username,
                    mode: 'login',
                    errors: errors.array()
                })

            }
            try {
                const matchUser = await getUserByUsername(req.body.username)
                const matchPassword = await bcrypt.compare(req.body.password, matchUser.password)
                if (!matchUser || !matchPassword)
                    throw 'Invalid Credentials'
                req.session.regenerate(() => {
                    req.session.username = matchUser.username
                    res.redirect('/')
                })
            } catch (e) {
                console.log(e)
                res.render('auth.njk', {
                    username: req.body.username,
                    mode: 'login',
                    errors: [{msg: 'Invalid Credentials'}]
                })
            }
        })

app.route("/register")
    .get((req, res) => {
        res.render('auth.njk', {mode: 'register'})
    })
    .post(body("username", "Username must be at least 3 characters")
            .trim()
            .isLength({min: 3})
            .escape()
            .toLowerCase(),
        body("password", "password must be at least 8 characters").isLength({min: 8})
        , async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('validation errors: ', errors.array())
                return  res.render('auth.njk', {
                    username: req.body.username,
                    mode: 'register',
                    errors: errors.array()
                })
            }
            try {
                const matchUser = await getUserByUsername(req.body.username)
                if (matchUser) {
                    return res.render('auth.njk', {
                        username: req.body.username,
                        mode: 'register',
                        errors: [{msg: 'Username is taken'}]
                    })
                }
                const newUser = req.body
                newUser.password = await bcrypt.hash(req.body.password, 10)
                await createUser(newUser)
                return res.render('auth.njk', {
                    username: req.body.username,
                    mode: 'login',
                    success: 'Successfully Created user! you may now login'
                })
            } catch (e) {
                console.log(e)
                next(e)
            }
        })


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect("/")
})


app.listen(5000, () => {
    console.log('listening on http://127.0.0.1:5000')
})