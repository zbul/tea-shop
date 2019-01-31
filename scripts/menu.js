function openMenu(){
    $("#master").hide();
    $("#show-menu").html("back to orders");
    $("#show-menu").off("click").on("click", showBackCurrentOrders);
    
    createMenuTemplate();
    sendRequest("/menu", {}, callback);
    function callback(data){
        menuLabels();
        data.forEach(function(item){
            var div = createMenuItemDiv(item._id);
            $('#menu-container').append(div);
            setupMenuItem(item, div);
        });
        
    }
}

function createMenuItemDiv(menuID) {
    return  `<div id=${menuID} class='menu-item'></div>`;

}

function setupMenuItem(menuValues){
    var deleteButton = `<button onclick="deleteMenuItem('${menuValues._id}')">delete</button>`
    var codeInput = `<input type='text' class='menu-code' value='${menuValues.registerCode}'>`;
    var nameInput = `<input type='text' class='menu-name' value='${menuValues.name}'>`;
    var price0Input = `<input type='text' class='menu-price0' value='${menuValues.prices.default}'>`;
    var price1Input = `<input type='text' class='menu-price1' value='${menuValues.prices.gaiwan}'>`;
    var price2Input = `<input type='text' class='menu-price2' value='${menuValues.prices.package}'>`;
    var price3Input = `<input type='text' class='menu-price3' value='${menuValues.prices.bulk}'>`;
    var updateButton = `<button onclick="updateMenuItem('${menuValues._id}')">update</button>`;
    
    var itemElements = [deleteButton, codeInput, nameInput, price0Input, price1Input, price2Input, price3Input, updateButton];
    
    $(`#${menuValues._id}`).append(itemElements);
}

function createMenuTemplate(){
    var menuDiv = "<div id='menu'></div>";
    var navigationPanel = "<div id='navigation'></div>";
    var menuContainer = "<div id='menu-container'></div>";

    var menuContainers = [navigationPanel, menuContainer]

    $('body').append(menuDiv);
    $('#menu').append(menuContainers);
    
    
}

function menuLabels(){
    var createNewButton = '<button onclick="newMenuItem()">Add Position</button>'
    var codeInput = `<input type='text' class='menu-code' value='Code'>`;
    var nameInput = `<input type='text' class='menu-name' value='Name'>`;
    var price0Input = `<input type='text' class='menu-price' value='Default price'>`;
    var price1Input = `<input type='text' class='menu-price' value='Gaiwan price'>`;
    var price2Input = `<input type='text' class='menu-price' value='Package price'>`;
    var price3Input = `<input type='text' class='menu-price' value='Bulk price'>`;
    var itemElements = [codeInput, nameInput, price0Input, price1Input, price2Input, price3Input, createNewButton];
    
    $('#navigation').append(itemElements);
}



function updateMenuItem(itemID){
    
    var newData = {
        name:  $(`#${itemID}.menu-item .menu-name`).val(),
        registerCode:  $(`#${itemID}.menu-item .menu-code`).val(),
        prices: {
            default: $(`#${itemID}.menu-item .menu-price0`).val(),
            gaiwan: $(`#${itemID}.menu-item .menu-price1`).val(),
            package: $(`#${itemID}.menu-item .menu-price2`).val(),
            bulk: $(`#${itemID}.menu-item .menu-price3`).val(),
        }
    };
    
        
    sendRequest("/menu/edit", {newData, _id: itemID}, callback);

    function callback(data){
      console.log("item edited");  
    }
    
}

function newMenuItem(){
    sendRequest("/menu/new", {}, callback);
    function callback(data){
        var div = createMenuItemDiv(data._id);
        $('#menu-container').prepend(div);
        setupMenuItem(data)
    }
}

function deleteMenuItem(itemID){
    sendRequest("/menu/delete", {_id: itemID}, callback);
    function callback(data){
        $(`#${itemID}.menu-item`).remove();
        console.log("item deleted");
    }
}

function showBackCurrentOrders(){
    $('#master').show();
    $('#menu').remove();
    $('#show-menu').html("Look at the menu");
    $('#show-menu').off("click").on("click", openMenu);
}