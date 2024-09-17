const { Course,Category} = require('../models/associations');

class layoutController{

    static async layout(req,res){
        const isLoggedIn = req.isAuthenticated(); 
        const courses = await Course.findAll();
        const categories = await Category.findAll({
            include: [{
                model: Course,
                as: 'courses'
            }]
        });
         
        return res.render('layout/home',{isLoggedIn,categories, courses});
    }
    static aboutus(req,res)
    {
        const isLoggedIn = req.isAuthenticated(); 
        res.render('layout/about-us',{isLoggedIn });
    }
    static contactus(req,res)
    {
        const isLoggedIn = req.isAuthenticated(); 
        res.render('layout/contact-us',{isLoggedIn});
    }
    static terms(req,res){
        const isLoggedIn = req.isAuthenticated(); 
        res.render('layout/terms',{isLoggedIn});
    }
    static privacy(req,res){
        const isLoggedIn = req.isAuthenticated(); 
        res.render('layout/privacy',{isLoggedIn});
    }
}

module.exports=layoutController;