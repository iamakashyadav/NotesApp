const isLogin=(req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect('/login');
    }
}

const isLogout=(req,res,next)=>{
    if(req.isAuthenticated()){
        res.redirect('/notes');
    }
    else{
        return next();
    }
}

module.exports={
    isLogin:isLogin,
    isLogout:isLogout
}