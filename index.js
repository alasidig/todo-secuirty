const templateEngin = require('nunjucks')
const express = require('express')
const cookieParser =  require('cookie-parser')
const {body, validationResult} = require('express-validator');
const {getAllTasks, addTask} = require("./todo_model");
const app = express()
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
templateEngin.configure('views', {
    express: app,
autoescape: false
});
app.route("/")
    .get(async (req, res) => {
        const author = req.cookies.author??''
        res.render('list.html', {tasks: await getAllTasks(),author})
    })
    .post(body('content', 'task title required').trim().isLength({min: 1}),
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


app.listen(5000, () => {
    console.log('listening on http://127.0.0.1:5000')
})