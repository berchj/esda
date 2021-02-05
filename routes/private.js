const express = require('express')
const router = express.Router()
const flash = require('express-flash')
const pool = require('../lib/pool')
const fileUpload = require('express-fileupload')
const path = require('path')
router.use(fileUpload())
router.use(flash())

router.get('/ingreso',(req,res)=>{
    res.render('ingreso',{message:req.flash('message')})
})

router.post('/procesar_ingreso',(req,res)=>{
    pool.getConnection((error,connection)=>{
        if (error) throw error
        let q = `SELECT * FROM users 
                 WHERE email = ${connection.escape(req.body.email)} 
                 AND password = ${connection.escape(req.body.password)}`
        connection.query(q,(error,rows,fields)=>{
            if(error) throw error
            if(rows.length > 0){
                res.status(200)
                req.session.user = rows[0]
                res.redirect('/private/p_index')             
            }else{
                res.status(404)
                req.flash('message','email o contraseña invalida')
                res.redirect('ingreso')
            }
        })
        connection.release()
    })
})

router.get('/private/p_index',(req,res)=>{
    pool.getConnection((error,connection)=>{
        if (error) throw error
        let q = `SELECT * FROM episodes`
        connection.query(q,(error,rows,fields)=>{
            if (error) throw error
            res.status(200)
            res.render('private/p_index',{user:req.session.user,data:rows,message:req.flash('message')})
        })
        connection.release()
    })    
})

router.get('/private/anadir-episodio',(req,res)=>{
    res.render('private/anadir-episodio',{message:req.flash('message'),user:req.session.user})    
})

router.post('/procesar_anadir',(req,res)=>{
    pool.getConnection((error,connection)=>{
        if(error) throw error
        const title = req.body.title.trim().toLowerCase()
        const description = req.body.description.trim().toLowerCase()        
        const user_id = req.session.user.id
        let q = `SELECT * FROM episodes WHERE title = ${connection.escape(title)}`    
        connection.query(q,(error,rows,fields)=>{
            if (error) throw error
            if(rows.length > 0){
                req.flash('message','titulo duplicado')
                res.redirect('/private/anadir-episodio')
            }else{
                let q1 = `SELECT * FROM episodes WHERE description = ${connection.escape(description)}`
                connection.query(q1,(error,rows,fields)=>{
                    if(error) throw error
                    if(rows.length > 0){
                        req.flash('message','descripcion duplicada')
                        res.redirect('/private/anadir-episodio')
                    }else{
                        if(req.files && req.files.image){                                                        
                            req.files.image.mv(`public/images/${req.files.image.name.trim()}`,(error)=>{
                                if (error) throw error                                
                                let q2 = `INSERT INTO episodes (title,description,image,user_id) VALUES 
                                (${connection.escape(title)},
                                ${connection.escape(description)},
                                ${connection.escape(req.files.image.name.trim())},
                                ${connection.escape(user_id)})`

                                connection.query(q2,(error,rows,fields)=>{
                                    if (error) throw error
                                    res.status(201)
                                    req.flash('message','episodio creado con exito')
                                    res.redirect('/private/anadir-episodio')
                                })
                            })                                                        
                        }else{
                            req.flash('message','el episodio debe tener una imagen')
                            res.redirect('/private/anadir-episodio')
                        }
                        
                    }
                })
            }
        })
        connection.release()                    
    })
})

router.get('/private/editar-episodio/:id',(req,res)=>{
    pool.getConnection((error,connection)=>{
        if (error) throw error
        let q = `SELECT * FROM episodes WHERE id = ${connection.escape(req.params.id)}`
        connection.query(q,(error,rows,fields)=>{
            if (error) throw error
            if(rows.length > 0){
                res.status(200)
                res.render('private/editar-episodio',{data:rows[0],user:req.session.user})
            }else{
                res.status(404)
                req.flash('message','El episodio no existe')
                res.redirect('/private/p_index')
            }
        })
        connection.release()
    })
})

router.post('/procesar_editar',(req,res)=>{
    console.log(req.body,req.files)
})

router.get('/procesar_cerrar_sesion',(req,res)=>{
    if(req.session.user){
        req.session.destroy((error)=>{
            if (error) throw error
            res.status(200)
            res.redirect('/')
        })
    }
})

module.exports = router