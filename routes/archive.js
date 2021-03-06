const   express         = require("express"),
        Order           = require("../models/order"),
        Item            = require("../models/item"),
        dbFunctions     = require("../functions/dbFunctions"),
        uiDisplay       = require("../functions/uiDisplay"),
        router          = express.Router({ mergeParams: true });

router.post("/", (req, res) => {
    if(req.body.date){
        var now = new Date(req.body.date);
        var dateCriteria = {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()+1),
        };
        Order.find({createdAt: dateCriteria}, (err, foundOrders) => {
            if(err) { console.log(err);} 
            else {res.send(foundOrders);}
        });  
    } else { res.send(''); }
});

router.post("/show-ordered-items", (req, res) => {
    let promisedOrder = dbFunctions.promiseToGetFromCollectionById(Order, req.body._id);
    promisedOrder.then( (order) => {
       let promisedItems = order.items.reduce( (promisedItems, item) => {
           return promisedItems.concat(dbFunctions.promiseToGetFromCollectionById(Item, item));
       }, []); 
       Promise.all(promisedItems).then((items) => {res.send(items);});
    });
});

router.post("/reopen", (req, res) => {
    let promisedOrder = dbFunctions.promiseToUpdateFromCollectionById(Order, req.body._id, {closed: false});
    promisedOrder.then( (order) => { res.send({order: order, tableProperties: uiDisplay.positionTable(order.table)}); });
});

module.exports = router;