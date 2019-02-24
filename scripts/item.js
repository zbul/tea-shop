/* global $ */
/* global sendRequest */

const item = {
    create: {
        inside: (orderId) => {
            sendRequest('/item/new', {orderID: orderId}, 
            (emptyItem) => { 
                item.create.container(orderId, emptyItem._id);});
        },
        container: (orderId, itemId) => {
            const itemContainer = `<div id=${itemId} class='item'></div>`;     
            $(`#${orderId}.order .item-container`).append(itemContainer);  
            $(`#${itemId}.item`).append(item.html.inputs(itemId));
        },
    },
    update: {
        name: function(){
            const   orderId   = $(this).parent().parent().parent()[0].id, 
                    itemId    = $(this).parent()[0].id;
            sendRequest('/item/edit/name', {orderId: orderId, itemId: itemId, name: $(this).val()}, 
            (data) => {
                item.read.setValues(data.item);
                if(data.err){ $(`#${itemId}.item .name`).css('background-color', 'red'); } 
                else { 
                    if(checkIfAllNameInputsAreUsed(orderId)){ item.create.inside(orderId); };
                    $(`#${itemId}.item .name`).css('background-color', 'silver'); 
                }
                updateSumOfPrices(orderId);
                updateSumOfDiscountedPrices(orderId);
                
            });
        },
        type: function(){
            const   itemId  = $(this).parent()[0].id,
                    orderId = $(this).parent().parent().parent()[0].id;
            sendRequest('/item/edit/type', {orderId: orderId, itemId: itemId, type: $(this).val()}, 
            (updatedItem) => {
                $(`#${itemId}.item .price`)             .val(Number(updatedItem.price).toFixed(2));
                $(`#${itemId}.item .discounted-price`)  .val(Number(updatedItem.discountedPrice).toFixed(2));
                updateSumOfPrices(orderId);
                updateSumOfDiscountedPrices(orderId)
            });
            
        },
        quantity: function(){
            const   itemId      = $(this).parent()[0].id,
                    orderId     = $(this).parent().parent().parent()[0].id;
            sendRequest('/item/edit/quantity', {orderId: orderId, itemId: itemId, quantity: $(this).val()}, 
            (updatedItem) => {
                $(`#${itemId}.item .price`)             .val(Number(updatedItem.price).toFixed(2));
                $(`#${itemId}.item .discounted-price`)  .val(Number(updatedItem.discountedPrice).toFixed(2));
                updateSumOfPrices(orderId);
                updateSumOfDiscountedPrices(orderId)
            });
        },
        price: function(){
            const   itemId      = $(this).parent()[0].id,
                    orderId     = $(this).parent().parent().parent()[0].id;
            sendRequest('/item/edit/price',{itemId: itemId, price: $(this).val(), orderId: orderId},
            (data) => {
                $(`#${data.order._id}.order .sum`).val(data.order.sum);
                $(`#${data.order._id}.order .discounted-sum`).val(data.order.discountedSum);
                $(`#${data.item._id}.item .discounted-price`).val(data.item.discountedPrice);
            });
        },
        discountedPrice: function(){
            const   itemId      = $(this).parent()[0].id,
                    orderId     = $(this).parent().parent().parent()[0].id;
            sendRequest('/item/edit/discounted-price',{itemId: itemId, discountedPrice: $(this).val(), orderId: orderId},
            (data) => {
                $(`#${data.order._id}.order .discounted-sum`).val(data.order.discountedSum);
                $(`#${data.item._id}.item .discounted-price`).val(data.item.discountedPrice);
            });
        },
    },
    read: {
        restore: (orderId, itemId) => {
                sendRequest('/item/show', {_id: itemId}, 
                (foundItem) => {
                var promise = new Promise((resolve,reject) => {
                    item.create.container( orderId, itemId); 
                    resolve();
                });
                promise.then((resolve) => { item.read.setValues(foundItem); }); 
              });
            },
        setValues:  (itemObject) => {
            const itemSelector = `#${itemObject._id}.item`;
            $(`${itemSelector} .name`)              .val(itemObject.name);
            $(`${itemSelector} .type`)              .val(itemObject.type);
            $(`${itemSelector} .quantity`)          .val(itemObject.quantity);
            $(`${itemSelector} .register-code`)     .val(itemObject.registerCode);
            $(`${itemSelector} .price`)             .val(Number(itemObject.price).toFixed(2));
            $(`${itemSelector} .discounted-price`)  .val(Number(itemObject.discountedPrice).toFixed(2));
        },
    },
    delete: (itemId) =>{
        sendRequest('/item/delete', {_id: itemId}, (msg) => { 
            const orderId = $(`#${itemId}.item`).parent().parent()[0].id;
            updateSumOfPrices(orderId);
            updateSumOfDiscountedPrices(orderId);
            $(`#${itemId}.item`).remove();
            if(checkIfAllNameInputsAreUsed(orderId)){ item.create.inside(orderId); };
        });
    
    },
    html: {
        inputs: (itemId) => {
            const   dumpsterIcon = `<i class="fas fa-trash-alt"></i>`;
            const   deleteButton          = `<button onclick='item.delete("${itemId}")' class='delete-button' >${dumpsterIcon}</button>`, 
                    nameInput             = '<input type="text"     class="name"            list="tees">',
                    codeInput             = '<input type="text"     class="register-code"   readonly>',
                    priceInput            = '<input type="number"   class="price">',
                    quantityInput         = '<input type="number"   class="quantity"        name="quantity" min="0" value="1">',
                    hintInput             = '<input type="text"     class="hint">',
                    discountedPriceInput  = '<input type="number"   class="discounted-price">',
                    typeInput             = `<select class="type">
                                                <option value="sztuka">     sztuka      </option>
                                                <option value="czajnik">    czajnik     </option>
                                                <option value="gaiwan">     gaiwan      </option>
                                                <option value="opakowanie"> opakowanie  </option>
                                                <option value="gram">       gram        </option>
                                            </select>`;
            return [deleteButton, codeInput, nameInput, typeInput, quantityInput, priceInput, hintInput, discountedPriceInput, ];
        },
    },
};
