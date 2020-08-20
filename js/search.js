
var DataStore=null;
var result = [];
var curpage = 0;
var currmodal = "";
var nbItemPerPage = 100;

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
        DataStore = data;
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
        curpage = Number(pageParam);
        renderResult();
    }

    if(modal && Object.values(DataStore).map(x => x.name).includes(modal)){
        displayModal(DataStore.filter(x => x.name === modal)[0]);
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
    entry.addEventListener("click",function(){displayModal(DataItem);}, false);
    var name = document.createElement("th");
    name.innerHTML = itemName;
    entry.appendChild(name);

    console.log(DataItem);

    if(DataItem["description"]){
        var description = document.createElement("td");
        description.innerHTML = DataItem.description;
        entry.appendChild(description);
    }
    

    var version = document.createElement("td");
    version.innerHTML = DataItem["version-string"];
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

    moreinfo.appendChild(moreinfobtn);
    entry.appendChild(moreinfo);

    output.appendChild(entry)
}

function displayModal(data){
    currmodal = data.name;
    updateURLParams();

    var modalbase = document.getElementById("modalbase");
    modalbase.className = "modal is-active";

    var modalname = document.getElementById("modalname");
    modalname.innerHTML = data.name;

    var modalversion = document.getElementById("modalversion");
    modalversion.innerHTML = data["version-string"];

    var modalwebsite = document.getElementById("modalwebsite");
    if(data.homepage){
        modalwebsite.href = data.homepage;
        modalwebsite.classList.remove("is-invisible");
    }else{
        modalwebsite.href = ""
        if(!modalwebsite.classList.contains("is-invisible")){
            modalwebsite.classList.add("is-invisible");
        }

    }

    var modallicense = document.getElementById("modallicense");
    var modallicensetxt = document.getElementById("modallicensetxt");
    if(data.license){
        modallicense.innerHTML = data.license;
        modallicense.classList.remove("is-hidden");
        modallicensetxt.classList.remove("is-hidden");
    }else{
        modallicense.innerHTML = ""
        if(!modallicense.classList.contains("is-hidden")){
            modallicense.classList.add("is-hidden");
        }
        if(!modallicensetxt.classList.contains("is-hidden")){
            modallicensetxt.classList.add("is-hidden");
        }

    }

    var modaldescription = document.getElementById("modaldescription");
    modaldescription.innerHTML = data.description;

    var modalwin = document.getElementById("modalwin");
    modalwin.innerText = `vcpkg.exe install ${data.name}`;

    var modalunix = document.getElementById("modalunix");
    modalunix.innerText = `vcpkg install ${data.name}`;

    var modalwinbtn = document.getElementById("modalwinbtn");
    modalwinbtn.replaceWith(modalwinbtn.cloneNode(true)); // Remove all event listeners
    modalwinbtn = document.getElementById("modalwinbtn");
    modalwinbtn.addEventListener("click", function(){ copyTextToClipboard(`vcpkg.exe install ${data.name}`)},false);

    var modalwinslct = document.getElementById("modalwinslct");
    var modalunixslct = document.getElementById("modalunixslct");
    if (navigator.appVersion.indexOf("Win")!=-1){
        modalwinslct.checked = true;
    }else{
        modalunixslct.checked = true;
    }


    var modalunixbtn = document.getElementById("modalunixbtn");
    modalunixbtn.replaceWith(modalunixbtn.cloneNode(true)); // Remove all event listeners
    modalunixbtn = document.getElementById("modalunixbtn");
    modalunixbtn.addEventListener("click", function(){ copyTextToClipboard(`vcpkg install ${data.name}`)},false);


    var modalusage = document.getElementById("modalusage");
    if(data.usage){
        modalusage.innerHTML = data.usage;
        modalusage.parentNode.classList.remove("is-hidden");
    }else{
        modalusage.innerHTML = "";
        if(!modalusage.parentNode.classList.contains("is-hidden")){
            modalusage.parentNode.classList.add("is-hidden");
        }
    }

    var modalfeatures = document.getElementById("modalfeatures");
    modalfeatures.textContent ='';
    if("features" in data){
        for( let item of Object.values(data["features"])){
            let tr = document.createElement("tr");
            let thname = document.createElement("th");
            thname.innerText = item.name;
            tr.appendChild(thname);
            let description = document.createElement("td");
            description.innerHTML = item.description;
            tr.appendChild(description);
            
            modalfeatures.appendChild(tr);
        }
    }

    var modalbdepends = document.getElementById("modalbdepends");
    modalbdepends.textContent = '';
    if("dependencies" in data){
        for(let item of data["dependencies"].map(x => (typeof x == 'string'? x: x.name) )){
            var tag = document.createElement("a");
            tag.innerText = item;
            tag.className = "tag is-link";
            if(Object.values(DataStore).map(x => x.name).includes(item.match(/[\w-]+/).toString()))
            {
                tag.href = `/?modal=${item.match(/[\w-]+/)}`;
            }
            modalbdepends.appendChild(tag);
        }
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

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
    //   console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
    //   console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }

  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
    //   console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
    //   console.error('Async: Could not copy text: ', err);
    });
  }