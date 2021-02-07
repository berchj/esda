(function(){
    window.addEventListener('scroll',function(){
        if(window.scrollY > 0){
            document.querySelector('header').classList.add('stick')
        }else{
            document.querySelector('header').classList.remove('stick')
        }
    })
}())