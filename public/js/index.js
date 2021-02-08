window.addEventListener('scroll',function(){
    if(window.scrollY > 0){
        document.querySelector('header').classList.add('stick')
    }else{
        document.querySelector('header').classList.remove('stick')
    }
})

function validate(){       
    if(window.location.pathname.includes('/ingreso')){
        if(document.forms[1]['email'].value.length < 1){
            alert('debe ingresar un email valido.')
            return false
        }
        if(document.forms[1]['password'].value.length < 1){
            alert('introduzca una contraseña valida')
            return false
        }
    }else if(window.location.pathname.includes('/registro')){
        if(document.forms[1]['username'].value.length < 3){
           alert('Debes ingresar un usuario de al menos 3 caracteres') 
           return false
        }
        if(document.forms[1]['email'].value.length < 1){
            alert('debes ingresar un email valido')
            return false
        }
        if(document.forms[1]['password'].value.length < 7){
            alert('la contraseña debe tener al menos 7 caracteres')
            return false
        }
    }else if (window.location.pathname.includes('/anadir-episodio')){
        if(document.forms[0]['title'].value.length < 5){
            alert('El titulo debe tener al menos 5 caracteres')
            return false
        }
        if(document.forms[0]['description'].value.length < 10){
            alert('la descripción debe tener al menos 10 caracteres')
            return false
        }
    }else if (window.location.pathname.includes('/editar-episodio')){
        if(document.forms[0]['title'].value.length < 5){
            alert('El titulo debe tener al menos 5 caracteres.')
            return false
        }
        if(document.forms[0]['description'].value.length < 10){
            alert('la descripción debe tener al menos 10 caracteres')
        }
    }
    return true
}        
