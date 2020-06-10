
var DataStore=null;
fetch("/data/libs.json")
    .then(response => response.json())
    .then(data => {
        DataStore = data;
        search();
    });


function search(){
    var searchbox = document.getElementById("searchbox");
    var cleanclass = searchbox.parentNode.className;
    searchbox.parentNode.className+= " is-loading";
    output = document.getElementById("searchResults");
    if(!DataStore){
        waiting =true
        return
    }
        
    console.time("query");
    const valid_matches = Object.keys(DataStore).filter(key => key.indexOf(searchbox.value) !== -1)
    console.timeEnd("query");

    // output.childNodes = new [];
    console.time("clear");
    output.textContent ='';
    // output.querySelectorAll('*').forEach(n => n.remove());
    console.timeEnd("clear");
    console.time("render");

    for(let match of valid_matches){
        renderResult(match);
        // console.log(DataStore[match])

    }
    console.timeEnd("render");
    searchbox.parentNode.className = cleanclass;
    // console.log(DataStore[searchbox.value])
    // console.log(DataStore)
    // console.log(searchbox.value)

}

function renderResult(result){
    var output = document.getElementById("searchResults");
    var entry = document.createElement("tr");
    entry.className = "container";
    var name = document.createElement("th");
    name.innerHTML = result;
    entry.appendChild(name);

    var description = document.createElement("td");
    description.innerHTML = DataStore[result].Description;
    entry.appendChild(description);

    var version = document.createElement("td");
    version.innerHTML = DataStore[result].Version;
    entry.appendChild(version);

    // name.appendChild(document.createTextNode(result));
    // entry.innerHTML = result;//DataStore[result];
    output.appendChild(entry)
}

// function clicksearch(){
//     searchbutton = document.getElementById("searchbutton")
//     // searchbutton.className+= " is-loading"
//     search()
//     // searchbutton.className.replace(" is-loading", "");
// }