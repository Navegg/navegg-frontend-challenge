let treeViewObject;
let currentId;
let editId = null;

// Load json file in localhost
function loadJSON(file_name) {
    return new Promise((resolve, reject) => {
        $.getJSON("http://localhost:8000/" + file_name, json => {
            resolve(json);
        }); 
    });
}

// Initialize code
async function init() {
    try {
        treeViewObject = await loadJSON("channels.json");
        currentId = treeViewObject.length + 1;
        generateTreeView();
        updateParentList();
    } catch(error) {
        console.error(error);
    }
}

// Generate a HTML code for a new item in the tree view
function generateListItem(treeViewItem) {
    innerHtml = "<div class=\"item\" id=\"parent_" + treeViewItem.id + "\">";
    innerHtml += "<i class=\"minus square outline icon\" id=\"icon_click\"></i>";
    innerHtml += "<div class=\"content\">";
    innerHtml += "<div class=\"header\">" + treeViewItem.name;
    innerHtml += "<i style=\"margin-left: 30px;\" class=\"pencil alternate icon\" id=\"icon_edit\"></i>";
    innerHtml += "<i style=\"margin-left: 10px;\" class=\"trash icon\" id=\"icon_delete\"></i>";
    innerHtml += "</div>";
    innerHtml += "<div class=\"description\"><b>Users:</b> " + treeViewItem.users + " - <b>Percent:</b> " + treeViewItem.percent +  " - <b>Status:</b> " + treeViewItem.status +"</div>";
    innerHtml += "<div class=\"relaxed divided list\" id=\"childs_" + treeViewItem.id + "\"></div>";
    innerHtml += "</div>";
    innerHtml += "</div>";

    return innerHtml;
}

// Clear the current tree view and generate a new one
function generateTreeView() {
    $("#root").html("<div class=\"ui relaxed divided list\" id=\"treeview\"></div>")
    for (index in treeViewObject) {
        if (treeViewObject[index].parent == null) {
            $("#treeview").append(generateListItem(treeViewObject[index]));
        } else {
            tag_parent = "#childs_" + treeViewObject[index].parent;
            $(tag_parent).append(generateListItem(treeViewObject[index]));
        }
    }
}

// Remove item in the array with the ID
function itemRemove(array, element) {
    return array.filter(function(ele) {
        return ele.id != element;
    });
}

// Update the list of options of available parents
function updateParentList() {
    $("#parent_list").html("<option value=\"\"></option>");
    for (index in treeViewObject) {
        $("#parent_list").append("<option value=\"" + treeViewObject[index].id + "\">" + treeViewObject[index].name + "</option>");
    }
}

// Remove all children related to the parent with id = itemId
function removeChildren(itemId) {
    let parentList = [];
    parentList.push(itemId);

    while (parentList.length > 0) {
        currentItem = parentList[0];
        for (index in treeViewObject) {
            if (parseInt(treeViewObject[index].parent) === parseInt(currentItem)) {
                parentList.push(treeViewObject[index].id);
            }
        }

        for (index in parentList) {
            treeViewObject = itemRemove(treeViewObject, parentList[index]);
        }
        parentList.shift();
    }
}

// Clear the field of modal fields
function clearModalFields() {
    name = $("#name_field").val("");
    users = $("#users_field").val("");
    percent = $("#percent_field").val("");
    parent = $("#parent_list").val("");
}

// Find index for the tree view item with id
function findItemIndex(idSearch) {
    for (index in treeViewObject) {
        if (parseInt(treeViewObject[index].id) === parseInt(idSearch)) {
            return index;
        }
    }
    return null;
}

// Validade the fields to create/update a new item
function validateItem(name, users, percent) {
    if (name === "") {
        alert("Name cannot be empty");
        return false;
    }
    if (users === "") {
        alert("Users cannot be empty");
        return false;
    }

    if (percent === "") {
        alert("Percent cannot be empty");
        return false;
    }

    if (isNaN(parseFloat(users))) {
        alert("Users must be a number");
        return false;
    }

    if (isNaN(parseFloat(percent))) {
        alert("Percent must be a number");
        return false;
    }

    return true;
}

$(document).ready(function() {
    $("#create_new").click(function(event) {
        editId = null;
        $(".ui.modal").modal("show"); 
    });
    
    $("#submit_button").click(function(event) {
        event.preventDefault();

        name = $("#name_field").val();
        users = $("#users_field").val();
        percent = $("#percent_field").val();
        parent = $("#parent_list").val();
        
        if (!validateItem(name, users, percent)) {
            return;
        }

        users = parseFloat(users);
        percent = parseFloat(percent);

        if (parent === "") {
            parent = null;
        }
        let newItem;

        // Verify if its creating a new one or editing an item
        if (editId == null) {
            newItem = {
                id: currentId,
                name: name,
                users: users,
                percent: percent,
                parent: parent
            }

            treeViewObject.push(newItem);
            currentId++;
        } else {
            let index = findItemIndex(editId);
            if (index != null) {
                treeViewObject[index].name = name;
                treeViewObject[index].users = users;
                treeViewObject[index].percent = percent;
                treeViewObject[index].parent = parent;
            }
        }

        // Clear modal fields, Generate a new tree and update list in the select
        clearModalFields();
        generateTreeView();
        updateParentList();
        
        $(".ui.modal").modal("hide"); 
    });
    
    $("#cancel_button").click(function(event) {
        event.preventDefault();
        clearModalFields();
        $(".ui.modal").modal("hide"); 
    });

    $('#root').on("click", "#icon_click", function(event){
        var par = $(event.target).parent();
        var className = $(event.target).attr("class");

        let father_id = $(par).attr("id");
        let child_id = "#childs_" + father_id.split("_")[1];

        // Change icon and hide/show children
        if (className === "plus square outline icon") {
            className = "minus square outline icon";
            $(par).find(child_id).show();
        } else {
            className = "plus square outline icon";
            $(par).find(child_id).hide();
        }

        $(event.target).attr("class", className);
    });

    $('#root').on("click", "#icon_edit", function(event){
        var par = $(event.target).parent();
        var grand_parent = $(par).parent();
        var grand_grand_parent = $(grand_parent).parent();

        let father_id = $(grand_grand_parent).attr("id");
        let index = findItemIndex(father_id.split("_")[1]);

        let item = treeViewObject[index];

        $("#name_field").val(item.name);
        $("#parent_list").val(item.parent === null ? "" : item.parent);
        $("#users_field").val(item.users);
        $("#percent_field").val(item.percent);
        
        editId = item.id;

        $(".ui.modal").modal("show");
    });

    $('#root').on("click", "#icon_delete", function(event){
        if (!confirm('Are you sure?')) return false;
        var par = $(event.target).parent();
        var grand_parent = $(par).parent();
        var grand_grand_parent = $(grand_parent).parent();

        let father_id = $(grand_grand_parent).attr("id");
        let index = findItemIndex(father_id.split("_")[1]);

        let item = treeViewObject[index];
        
        treeViewObject = itemRemove(treeViewObject, item.id);

        removeChildren(item.id);

        generateTreeView();
        updateParentList();
    });
    
    init();
});