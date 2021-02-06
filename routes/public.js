const express = require('express')
const router = express.Router()
const flash = require('express-flash')
const pool = require('../lib/pool')
router.use(flash())

router.get('/',(req,res)=>{
    res.render('index',{message:req.flash('message')})
})

router.get('/episodios',(req,res)=>{
    pool.getConnection((error,connection)=>{
        if(error) throw error
        let q = `SELECT * FROM episodes`
        connection.query(q,(error,rows,fields)=>{
            if (error) throw error
            res.status(200)
            res.render('episodios',{data:rows,message:req.flash('message')})
        })
        connection.release()
    })
})

router.get('/episodio/:id',(req,res)=>{
    pool.getConnection((error,connection)=>{
        if(error) throw error
        let q = `SELECT * FROM episodes WHERE id = ${connection.escape(req.params.id)}`
        connection.query(q,(error,rows,fields)=>{
            if(error) throw error
            if(rows.length > 0){
                res.status(200)
                res.render('episodio',{data:rows[0]})
            }else{
                res.status(404)
                req.flash('message','el episodio no existe')
                res.redirect('/episodios')
            }
        })
        connection.release()
    })
})

module.exports = router