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
        generateTreeView();
    } catch(error) {
        console.error(error);
    }
}

function generateListItem(treeViewItem) {
    innerHtml = "<div class=\"item\" id=\"parent_" + treeViewItem.id + "\">";
    innerHtml += "<i class=\"minus square outline icon\" id=\"icon_click\"></i>";
    innerHtml += "<div class=\"content\">";
    innerHtml += "<div class=\"header\">" + treeViewItem.name  + " - " + treeViewItem.users + " - " + treeViewItem.percent + "</div>";
    innerHtml += "<div class=\"list\" id=\"childs_" + treeViewItem.id + "\"></div>";
    innerHtml += "</div>";
    innerHtml += "</div>";

    return innerHtml;
}

function generateTreeView() {
    $("#root").html("<div class=\"ui list\" id=\"treeview\"></div>")
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



$(document).ready(function() {
    init();
});