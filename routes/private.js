const express = require('express')
const router = express.Router()
const flash = require('express-flash')
const pool = require('../lib/pool')
const fileUpload = require('express-fileupload')
const path = require('path')
router.use(fileUpload())
router.use(flash())

router.use('/private/p_index',(req,res,next)=>{
    if(!req.session.user){
        req.flash('message','debe iniciar sesion.')
        res.redirect('/')
    }else{
        next()
    }
})

router.get('/ingreso',(req,res)=>{
    res.render('ingreso',{message:req.flash('message')})
})

router.get('/registro',(req,res)=>{
    res.render('registro',{message:req.flash('message')})
})

router.post('/procesar_registro',(req,res)=>{
    console.log(req.body)
    pool.getConnection((error,connection)=>{
        if (error) throw error
        let q = `SELECT * FROM users WHERE email = ${connection.escape(req.body.email.toLowerCase())}`
        connection.query(q,(error,rows,fields)=>{
            if(error) throw error
            if(rows.length > 0){
                req.flash('message','email en uso')
                res.redirect('/registro')
            }else{
                let q1 = `SELECT * from users WHERE username = ${connection.escape(req.body.username.trim().toLowerCase())}`
                connection.query(q1,(error,rows,fields)=>{
                    if (error) throw error
                    if(rows.length > 0){
                        req.flash('message','nombre de usuario en uso')
                        res.redirect('/registro')
                    }else{
                        let q2 = `INSERT INTO users (username,email,password) VALUES (${connection.escape(req.body.username.trim().toLowerCase())},
                                                                                      ${connection.escape(req.body.email.toLowerCase())},
                                                                                      ${connection.escape(req.body.password)})`
                        connection.query(q2,(error,rows,fields)=>{
                            if (error) throw error
                            res.status(201)
                            req.flash('message','Usuario creado con exito, puede iniciar sesion')
                            res.redirect('/ingreso')
                        })
                    }
                })
            }
        })
    })
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
        let q = `select username,episodes.id,points,title from episodes inner join users where episodes.id = users.id order by points desc`
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
                res.render('private/editar-episodio',{data:rows[0],user:req.session.user,message:req.flash('message')})
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
    console.log(req.files.image.name)
    pool.getConnection((error,connection)=>{
        if (error) throw error
        let q = `SELECT * FROM episodes WHERE title = ${connection.escape(req.body.title.trim().toLowerCase())}`
        connection.query(q,(error,rows,fields)=>{  
            if (error) throw error
            if(rows.length > 0){
                req.flash('message','ese titulo ya existe')
                res.redirect(`/private/editar-episodio/${req.body.id}`)
            }else{
                let q1 = `SELECT * FROM episodes WHERE description = ${connection.escape(req.body.description.trim().toLowerCase())}`
                connection.query(q1,(error,rows,fields)=>{
                    if (error) throw error
                    if(rows.length > 0){
                        req.flash('message','esa descripcion ya existe')
                        res.redirect(`/private/editar-episodio/${req.body.id}`)
                    }else{
                        let q2 = `SELECT * FROM episodes WHERE image = ${connection.escape(req.files.image.name)}`
                        connection.query(q2,(error,rows,fields)=>{
                            if (error) throw error
                            if(rows.length > 0){
                                req.flash('message','imagen repetida.')
                                res.redirect(`/private/editar-episodio/${req.body.id}`)                                
                            }else{
                                if(req.files && req.files.image){
                                    req.files.image.mv(`public/images/${req.files.image.name.trim().toLowerCase()}`,(error)=>{
                                        if (error) throw error
                                        let q3 = `UPDATE episodes SET title = ${connection.escape(req.body.title)},
                                                                      description  = ${connection.escape(req.body.description)},
                                                                      image = ${connection.escape(req.files.image.name.trim().toLowerCase())}
                                                  WHERE id = ${connection.escape(req.body.id)}`
                                        connection.query(q3,(error,rows,fields)=>{
                                            if(error) throw error
                                            res.status(200)
                                            req.flash('episodio actualizado correctamente')
                                            res.redirect(`/private/p_index`)
                                        })                                       
                                    })
                                }
                            }
                        })
                    }
                })
            }
        })
        connection.release()
    })
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