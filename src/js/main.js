let treeViewObject;

function loadJSON() {
    return new Promise((resolve, reject) => {
        $.getJSON("http://localhost:8000/channels.json", json => {
            resolve(json);
        }); 
    });
}

async function init() {
    try {
        treeViewObject = await loadJSON();
        console.log(treeViewObject);
        generateTreeView();
        updateParentList();
    } catch(error) {
        console.error(error);
    }
}

function generateListItem(treeViewItem) {
    innerHtml = "<div class=\"item\" id=\"parent_" + treeViewItem.id + "\">";
    innerHtml += "<i class=\"minus square outline icon\" id=\"icon_click\"></i>";
    innerHtml += "<div class=\"content\">";
    innerHtml += "<div class=\"header\">" + treeViewItem.name;
    innerHtml += "<i class=\"pencil alternate icon\" id=\"icon_click\"></i>";
    innerHtml += "<i class=\"trash icon\" id=\"icon_click\"></i>";
    innerHtml += "</div>";
    innerHtml += "<div class=\"description\"><b>Users:</b> " + treeViewItem.users + " - <b>Percent:</b> " + treeViewItem.percent + "</div>";
    innerHtml += "<div class=\"relaxed divided list\" id=\"childs_" + treeViewItem.id + "\"></div>";
    innerHtml += "</div>";
    innerHtml += "</div>";

    return innerHtml;
}

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
    $('#root').on("click", "#icon_click", function(event){
        var par = $(event.target).parent();
        var className = $(event.target).attr("class");

        let father_id = $(par).attr("id");
        let child_id = "#childs_" + father_id.split("_")[1];

        if (className === "plus square outline icon") {
            className = "minus square outline icon";
            $(par).find(child_id).show();
        } else {
            className = "plus square outline icon";
            $(par).find(child_id).hide();
        }

        $(event.target).attr("class", className);
    });
}

function updateParentList() {
    for (index in treeViewObject) {
        $("#parent_list").append("<option value=\"" + treeViewObject[index].id + "\">" + treeViewObject[index].name + "</option>");
    }
}

function clearModalFields() {
    name = $("#name_field").val("");
    users = $("#users_field").val("");
    percent = $("#percent_field").val("");
    parent = $("#parent_list").val("");
}

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

        let newItem = {
            id: treeViewObject.length,
            name: name,
            users: users,
            percent: percent,
            parent: parent
        }

        treeViewObject.push(newItem);
        
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

    init();


});