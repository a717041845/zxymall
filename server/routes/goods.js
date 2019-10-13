var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

// 连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/zxymall');

mongoose.connection.on("connected", function () {
    console.log("MongoBD connected success.")
});

mongoose.connection.on("error", function () {
    console.log("MongoBD connected fail.")
});

mongoose.connection.on("disconnected", function () {
    console.log("MongoBD connected disconnected.")
});

// 查询商品列表数据
router.get('/',function (req,res,next){
    let page = parseInt(req.param("page"));
    let pageSize =  parseInt(req.param("pageSize"));
    let priceLevel = req.param("priceLevel");
    let sort = req.param("sort");
    let skip =(page-1)*pageSize;
    let params = {};
    var priceGt='';
    var priceLte='';
    if(priceLevel != "all"){
        switch(priceLevel){
            case "0":priceGt = 0; priceLte = 500;break;
            case "1":priceGt = 500; priceLte = 1000;break;
            case "2":priceGt = 1000; priceLte = 2000;break;
            case "3":priceGt = 2000; priceLte = 4000;break;
        }
        params = {
            salePrice:{
                $gt:priceGt,
                $lte:priceLte
            }
        }
    }
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice':sort});
    goodsModel.exec( (err,doc)=>{
        if(err){
            res.json({
                status:'1',
                msg:err.message
            });
        }else{
            res.json({
                status:'0',
                msg:'',
                result:{
                    count:doc.length,
                    list:doc
                }
            });
        }
    })
});

// 加入到购物车
router.post("/addCart",function (req,res,next){
    var userId = "100000077",productId = req.body.productId;
    var Users = require('./../models/user');

    Users.findOne({userId:userId},function (err,userDoc) {
        if(err){
            res.json({
                status:"1",
                msg:err.message
            })
        }else{
            // console.log("userDoc:"+userDoc);
            if(userDoc){
                let goodsItem = "";
                userDoc.cartList.forEach((item) => {
                    if(item.productId == productId){
                        goodsItem = item;
                        item.productNum ++;
                    }
                });
                if(goodsItem){
                    userDoc.save(function (err2,doc2) {
                        if(err2){
                            res.json({
                                status:"1",
                                msg:"err.message"
                            })
                        }else{
                            res.json({
                                status:"0",
                                msg:'xzy',
                                result:'suc'
                            })
                        }
                    });
                }else{
                    Goods.findOne({productId:productId}, function (err,doc){
                        if(err){
                            res.json({
                                status:"1",
                                msg:err.message
                            })
                        }else{
                            if(doc){
                                doc["productNum"] = 1;
                                doc["checked"] = 1;
                                console.log("doc:"+doc);
                                userDoc.cartList.push(doc);
                                userDoc.save(function (err2,doc2) {
                                    if(err2){
                                        res.json({
                                            status:"1",
                                            msg:"err.message"
                                        })
                                    }else{
                                        res.json({
                                            status:"0",
                                            msg:'xzy',
                                            result:'suc'
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
                
            }
        }
    })
})

module.exports = router;