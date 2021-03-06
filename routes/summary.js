const   express         = require("express"),
        Order           = require("../models/order"),
        Item            = require("../models/item"),
        Menu            = require("../models/menu"),
        dbFunctions     = require("../functions/dbFunctions"),
        uiDisplay       = require("../functions/uiDisplay"),
        router          = express.Router({ mergeParams: true });

router.post("/", (req, res) => {
    var first = new Date(req.body.first);
    var last = new Date(req.body.last);
    var dateCriteria = {
        $gte: new Date(first.getFullYear(), first.getMonth(), first.getDate()),
        $lt: new Date(last.getFullYear(), last.getMonth(), last.getDate()+1),
    };
    
    let promisedMenuItems = new Promise( (resolve, reject) => {
        Menu.find({}, (err, menuItems) => {
            if(err){ reject(err); }
            else {
                const object = {
                    id: [], 
                    names: [], 
                    quantity: {
                        all: [], 
                        default: [], 
                        gaiwan: [], 
                        package: [], 
                        bulkCount: [],
                        bulk: [],
                    }, 
                    income: []
                };
                resolve(menuItems.reduce((accumulator, menuItem) => {
                    accumulator.id.push(menuItem._id);
                    accumulator.names.push(menuItem.name);
                    accumulator.quantity.all.push(0);
                    accumulator.quantity.default.push(0);
                    accumulator.quantity.gaiwan.push(0);
                    accumulator.quantity.package.push(0);
                    accumulator.quantity.bulkCount.push(0);
                    accumulator.quantity.bulk.push(0);
                    accumulator.income.push(0);
                    return accumulator;
                }, object));
            }
        }); 
    });
    let promisedOrders = new Promise((resolve, reject) => {
        Order.find({createdAt: dateCriteria}, (err, foundOrders) => {
            if(err){ reject(err); }
            else{ resolve(foundOrders) }
        });
    });
    Promise.all([promisedMenuItems, promisedOrders]).then(values => {
        let menuStats = values[0];
        let orders = values[1];
        var itemIds = orders.reduce((idArray, order) => {
            return idArray.concat(order.items);
        }, []); 
        Item.find({'_id': { $in: itemIds}}, (err, foundItems)=> {
            if(err){ console.log(err);}
            else {
                let promises = foundItems.reduce((promiseChain, foundItem) => {
                    return promiseChain.then( () => new Promise( (resolve) => {
                        var itemIndex = menuStats.names.indexOf(foundItem.name);
                        const englishType = translateType(foundItem.type);
                        menuStats.quantity[englishType][itemIndex] += Number(foundItem.quantity);
                        if(englishType == 'bulk'){
                            menuStats.quantity.bulkCount[itemIndex] += 1;
                            menuStats.quantity.all[itemIndex] += 1;
                        } else {
                            menuStats.quantity.all[itemIndex] += Number(foundItem.quantity);
                        }
                        menuStats.income[itemIndex] += Number(foundItem.discountedPrice); 
                        resolve();
                    }));
                }, Promise.resolve());
                promises.then( () => { res.send(menuStats); });
            }                    
        });
    });
});

router.post("/hours", (req, res) => {
    var first = new Date(req.body.first);
    var last = new Date(req.body.last);
    var dateCriteria = {
        $gte: new Date(first.getFullYear(), first.getMonth(), first.getDate()),
        $lt: new Date(last.getFullYear(), last.getMonth(), last.getDate()+1),
    };
    let promisedOrders = new Promise((resolve, reject) => {
        Order.find({createdAt: dateCriteria}, (err, foundOrders) => {
            if(err){ reject(err); }
            else{ resolve(foundOrders); }
        });
    });
    promisedOrders.then((foundOrders) => {
        var dataStructure = {
            hour: [],
            count: [],
            income: [],
        };
        var data = foundOrders.reduce((data, order) => {
            const hours = new Date(order.createdAt).getHours();
            if(data.hour.indexOf(hours) < 0){
                data.hour.push(hours);
                data.count.push(1);
                data.income.push(Number(order.discountedSum));
                return data;
            } else {
                const i = data.hour.indexOf(hours);
                data.count[i] += 1;
                data.income[i] += Number(order.discountedSum);
                return data;
            }
        }, dataStructure ); 
        res.send(data);
    });
});

function translateType(type){
    if(type == 'sztuka'){ return 'default'; }
    else if(type == 'gaiwan'){ return 'gaiwan'; }
    else if(type == 'opakowanie'){ return 'package'; }
    else if(type == 'gram'){ return 'bulk'; }
    else { return "translateType error: Wrong type"; }
}

module.exports = router;