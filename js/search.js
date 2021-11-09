
var DataStore=null;
var result = [];
var curpage = 0;
var currmodal = "";
var nbItemPerPage = 50;

const fuseOption = {
    threshold:0.35,
    keys: [
        "name",
        "description"
    ]
};
var fuse = null;

fetch("/data/libs.json")
    .then(response => response.json())
    .then(data => {
        DataStore = data["packages"];
        fuse = new Fuse(Object.values(DataStore),fuseOption);
        syncStateFromParams();
    });

window.addEventListener('popstate',syncStateFromParams);

function syncStateFromParams(){
    var url = new URL(window.location.href);
    var params = url.searchParams;
    var searchParam = params.get("search");
    var regexParam = params.get("regex");
    var pageParam = params.get("page");
    var modal = params.get("modal");

    var searchbox = document.getElementById("searchbox");
    var regexopt = document.getElementById("regexopt");

    if(searchParam)
        searchbox.value = searchParam;
    if(regexParam)
        regexopt.checked = !!regexParam;
    
    search();

    if(pageParam && !isNaN(Number(pageParam))){
        curpage = Number(pageParam)-1;
        renderResult();
    }
    updatePageBtnState();

    // kept for backward compatibility with first version of the site
    if(modal && Object.values(DataStore).map(x => x.name).includes(modal)){
        navigateToDetails(modal);
    }
}

function updateURLParams(){
    var url = new URL(window.location.href);
    var params = url.searchParams;

    var searchbox = document.getElementById("searchbox");
    var regexopt = document.getElementById("regexopt");

    if(searchbox.value){
        params.set("search",searchbox.value);
    }else{
        params.delete("search");
    }
    if(regexopt.checked){
        params.set("regex", regexopt.checked.toString());

    }else{
        params.delete("regex");
    }
    if (curpage!=0) {
        params.set("page", (curpage+1).toString());
        
    } else {
        params.delete("page");
    }

    if(currmodal){
        params.set("modal", currmodal);
    }else{
        params.delete("modal");
    }

    url.search = params.toString();

    window.history.replaceState({}, searchbox.value, url.toString());
}


function search(){
    var searchbox = document.getElementById("searchbox");
    var regexopt = document.getElementById("regexopt");
    var cleanclass = searchbox.parentNode.className;
    // searchbox.parentNode.className+= " is-loading";
    if(!DataStore){
        waiting =true
        return
    }
    console.log( )
    console.time("query");
    if(!regexopt.checked){
        if (searchbox.value) {
            result = fuse.search(searchbox.value).map(x => x.item.name);
        } else {
            result = Object.values(DataStore).map(x => x.name).sort();
            
        }
        
    }else{
        result = Object.values(DataStore).map(x => x.name).filter(key => key.match(searchbox.value));
    }
    console.timeEnd("query");

    curpage = 0;
    renderResult();
    updatePageBtnState();
    
    // searchbox.parentNode.className = cleanclass;
}
function renderResult(){
    var output = document.getElementById("searchResults");

    console.time("clear");
    output.textContent ='';
    console.timeEnd("clear");

    console.time("render");
    var resultsNB = document.getElementById("resultsNB");
    resultsNB.innerHTML = result.length.toString();
    for(let match of result.slice(nbItemPerPage*curpage,nbItemPerPage*(curpage+1))){
        renderRow(match);
    }
    console.timeEnd("render");
    updateURLParams();

}
function renderRow(itemName){
    let DataItem = DataStore.filter(x => x.name === itemName)[0];
    var output = document.getElementById("searchResults");
    var entry = document.createElement("tr");
    entry.className = "container is-clickable";
    entry.addEventListener("click",function(){navigateToDetails(itemName)}, false);
    var name = document.createElement("th");
    name.innerHTML = itemName;
    entry.appendChild(name);

    if(DataItem["description"]){
        var description = document.createElement("td");
        description.innerHTML = DataItem.description;
        entry.appendChild(description);
    }
    

    var version = document.createElement("td");
    version.innerHTML = DataItem["version"] || DataItem["version-string"];
    entry.appendChild(version);

    var license = document.createElement("td");
    if(DataItem.license){
        license.innerHTML = DataItem.license;
    }
    entry.appendChild(license);

    var moreinfo = document.createElement("td");
    var moreinfobtn = document.createElement("a");
    moreinfobtn.innerHTML = '<span class="icon"><i class="fas fa-info fa-lg"></i></span>';
    moreinfobtn.className = "button is-text";
    moreinfobtn.href = `/details.html?package=${encodeURIComponent(itemName)}`;

    moreinfo.appendChild(moreinfobtn);
    entry.appendChild(moreinfo);

    output.appendChild(entry)
}

function navigateToDetails(packageName){
    window.location = `/details.html?package=${encodeURIComponent(packageName)}`;
}

function nextpage(){
    curpage++;
    renderResult();
    updatePageBtnState();
}

function prevpage(){
    curpage--;
    renderResult();
    updatePageBtnState();

}

function updatePageBtnState(){
    var nextbtn = document.getElementById("nextbtn");
    var prevbtn = document.getElementById("prevbtn");
    var pagenb = document.getElementById("pagenb");

    pagenb.innerText = (curpage+1).toString();

    
    if(result.length<=nbItemPerPage*(curpage+1)){
        nextbtn.disabled = true;
    }else{
        nextbtn.disabled = false;

    }
    if(curpage <=0){
        curpage = 0;
        prevbtn.disabled = true;

    }else{
        prevbtn.disabled = false;

    }
}

function collapse(){
    var elem = event.target.parentNode;
    if(elem.classList.contains("collapsable")){
        elem.classList.toggle("collapsed");

    }
}
