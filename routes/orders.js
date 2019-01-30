var express = require("express");
var router = express.Router({ mergeParams: true });
var Order = require("../models/order");
var OrderedItem = require("../models/orderedItem");
var pricesAndSums = require("../functions/pricesAndSums");

router.post("/new", function(req, res){
    Order.create({}, function(err, createdOrder){
        if(err){
            console.log(err);
        } else {
            res.send(createdOrder);
        }
    });
});

router.post("/edit", function(req, res){
    Order.findByIdAndUpdate(
        {_id: req.body.orderID}, 
        req.body.values, 
        {new: true}, 
        function(err, updatedOrder){
            if(err){
                
                console.log(err);
                
            } else {
                
            OrderedItem.find(
            {_id: { $in: updatedOrder.orderedItems}}, 
            function(err, orderedItems){
                if(err){
                    console.log(err);
                } else {
                    var sum = pricesAndSums.calculateSum(orderedItems).toString();
                    var discountedSum = pricesAndSums.calculateDiscountedPricesForOrder(orderedItems, updatedOrder, OrderedItem).toString();
                    Order.findByIdAndUpdate({_id: req.body.orderID }, 
                    {sum: sum, discountedSum: discountedSum}, {new: true}, 
                    function(err, updatedOrder){
                        if(err){
                            console.log(err);
                        } else {
                            res.send({sum: updatedOrder.sum, discountedSum: updatedOrder.discountedSum});    
    
                        }
                    });
                    
                }
        
            });
            
        }
    });
   
});

router.post("/edit-table", function(req,res){
 Order.findByIdAndUpdate({_id: req.body._id}, {table: req.body.table}, function(err){
  if(err){console.log(err); } 
  else { res.send("done");}
 });
});

router.post("/edit-sum", function(req, res){
 
  Order.find({_id: req.body._id}, function(err, foundOrder){
    if(err) { console.log(err); }
    else {
      foundOrder = foundOrder[0];
      OrderedItem.find({_id: {$in: foundOrder.orderedItems}}, function(err, foundItems){
        if(err) { console.log(err); }
        else {
          var sum = pricesAndSums.calculateSum(foundItems);
          Order.findByIdAndUpdate(
            {_id: foundOrder._id}, 
            {sum: sum},
            {new: true},
            function(err, updatedOrder){
              if(err) { console.log("wrong"); console.log(err); }
              else { res.send({sum: updatedOrder.sum}); }
            });
        }
      });
    }
  });
});

module.exports = router;