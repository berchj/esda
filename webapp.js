const express = require('express')
const app = express()
const port = 7200
const bodyParser = require('body-parser')
const publicRouter = require('./routes/public')
const privateRouter = require('./routes/private')
const session = require('express-session')
app.use(session({secret:'my-secret-token',resave:true,saveUninitialized:true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(publicRouter)
app.use(privateRouter)

app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})
