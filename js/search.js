
var DataStore=null;
var result = [];
var curpage = 0;
var currmodal = "";
var nbItemPerPage = 100;

const fuseOption = {
    threshold:0.35
};
var fuse = null;

fetch("/data/libs.json")
    .then(response => response.json())
    .then(data => {
        DataStore = data;
        fuse = new Fuse(Object.keys(DataStore),fuseOption);
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
        curpage = Number(pageParam);
        renderResult();
    }

    if(modal && DataStore[modal]){
        displayModal(modal,DataStore[modal]);
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
        params.set("page", curpage.toString());
        
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
    output = document.getElementById("searchResults");
    if(!DataStore){
        waiting =true
        return
    }
    console.log( )
    console.time("query");
    if(!regexopt.checked){
        if (searchbox.value) {
            result = fuse.search(searchbox.value).map(x => x.item);
        } else {
            result = Object.keys(DataStore);
            
        }
        
    }else{
        result = Object.keys(DataStore).filter(key => key.match(searchbox.value));
    }
    console.timeEnd("query");

    curpage = 0;
    renderResult();
    updatePageBtnState();
    
    // searchbox.parentNode.className = cleanclass;
}
function renderResult(){
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
    var output = document.getElementById("searchResults");
    var entry = document.createElement("tr");
    entry.className = "container";
    entry.addEventListener("click",function(){displayModal(itemName,DataStore[itemName]);}, false);
    entry.onmouseenter
    var name = document.createElement("th");
    name.innerHTML = itemName;
    entry.appendChild(name);

    var description = document.createElement("td");
    description.innerHTML = DataStore[itemName].Description;
    entry.appendChild(description);

    var version = document.createElement("td");
    version.innerHTML = DataStore[itemName].Version;
    entry.appendChild(version);

    var moreinfo = document.createElement("td");
    var moreinfobtn = document.createElement("a");
    moreinfobtn.innerHTML = '<span class="icon"><i class="fas fa-info fa-lg"></i></span>';
    moreinfobtn.className = "button is-text";

    moreinfo.appendChild(moreinfobtn);
    entry.appendChild(moreinfo);

    output.appendChild(entry)
}

function displayModal(name, data){
    currmodal = name;
    updateURLParams();

    var modalbase = document.getElementById("modalbase");
    modalbase.className = "modal is-active";

    var modalname = document.getElementById("modalname");
    modalname.innerHTML = name;

    var modalversion = document.getElementById("modalversion");
    modalversion.innerHTML = DataStore[name].Version;

    var modaldescription = document.getElementById("modaldescription");
    modaldescription.innerHTML = DataStore[name].Description;

    var modalbdepends = document.getElementById("modalbdepends");
    modalbdepends.textContent = '';
    for(let item of DataStore[name]["Build-Depends"]){
        var tag = document.createElement("span");
        tag.innerText = item;
        tag.className = "tag";
        modalbdepends.appendChild(tag);
    }
}

function hiddeModal(){
    var modalbase = document.getElementById("modalbase");
    modalbase.className = "modal"
    currmodal = "";
    updateURLParams();
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