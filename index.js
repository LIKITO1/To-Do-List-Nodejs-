const express=require("express")
const app=express()
const handlebars=require("express-handlebars")
const bodyParser=require("body-parser")
const Sequelize=require("sequelize")
const sequelize=new Sequelize("tarefas","root","lucas312@Lucas",{
    host:"localhost",
    dialect:"mysql"
})
const port=process.env.PORT || 3001
const Deveres=sequelize.define("deveres",{
    tarefa:{
        type:Sequelize.STRING
    },
    description:{
        type:Sequelize.TEXT
    },
    nome:{
        type:Sequelize.STRING
    }
})
const Usuarios=sequelize.define("usuarios",{
    nome:{
        type:Sequelize.STRING
    },
    senha:{
        type:Sequelize.TEXT
    }
})
let flag=false;
let flag1=false;
let flag2=false;
let flag3=false;
let nomeUser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.engine("handlebars", handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}))
app.set("view engine","handlebars")
app.get("/",(req,res)=>{
    res.render("login")
})
app.get("/criarconta",(req,res)=>{
    if(flag==true){
        res.render("criar",{aviso:"Este nome já pertence a outro usuário"})
    }
    else{
        res.render("criar")
    }
})
app.get("/home",(req,res)=>{
    res.render("home")
})
app.post("/processando",(req,res)=>{
    Deveres.create({
        tarefa:req.body.tarefa,
        description:req.body.description,
        nome:nomeUser
    }).then(()=>{
        res.redirect("/processou")
    }).catch((err)=>{
        res.send(err)
    })
})
app.get("/processou",(req,res)=>{
    Deveres.findAll({order:[["id","DESC"]],where:{
        nome:{
            [Sequelize.Op.like]:nomeUser
        }
    }}).then((deveres)=>{
        res.render("cadastrada",{dever:deveres})
    }).catch((err)=>{
        res.send(err)
    })
})
app.get("/deletar/:id",(req,res)=>{
    Deveres.destroy({where:{"id":req.params.id}}).then(()=>{
        res.redirect("/processou")
    }).catch((err)=>{
        res.send(err)
    })
})
app.post("/logando",(req,res)=>{
    Usuarios.findAll().then((users)=>{
        flag1=false
        flag2=false
        flag3=false
        nomeUser=req.body.nome
        users.forEach((user)=>{
            if(req.body.nome==user.nome&&req.body.senha==user.senha){
                flag1=true
            }
            else if(req.body.nome==user.nome&&req.body.senha!=user.senha){
                flag2=true
            }
            else if(req.body.nome!=user.nome){
                flag3=true
            }
        })
        if(flag1==true){
            res.redirect("/home")
        }
        else if(flag2==true){
            res.render("login",{aviso:"Senha incorreta"})
        }
        else if(flag3==true){
            res.render("login",{aviso:"Usuário inexistente"})
        }
    }).catch((err)=>{
        console.log(err)
    })
})
app.post("/criando",(req,res)=>{
    flag=false
    Usuarios.findAll().then((users)=>{
        users.forEach((valor)=>{
            if(req.body.nome==valor.nome && flag!=true){
                flag=true
            }
        })
        if(flag!=true){
            Usuarios.create({
                nome:req.body.nome,
                senha:req.body.senha
            })
            nomeUser=req.body.nome
            res.redirect("/home")
        }
        else{
            res.redirect("/criarconta")
        }
    }).catch((err)=>{
        console.log(err)
    })
})
app.listen(8081)