var DataStore=null;

var failedTriplet = {};

fetch("/data/libs.json")
    .then(response => response.json())
    .then(data => {
        DataStore = data['packages'];
        syncStateFromParams();
    });

function syncStateFromParams(){
    var url = new URL(window.location.href);
    var params = url.searchParams;
    var packageName = params.get("package");

    if (packageName && Object.values(DataStore).map(x => x.name).includes(packageName)) {
        packageName = decodeURIComponent( packageName);
        var found = DataStore.filter(x => x.name === packageName);
        if(found && found.length>0){
            displayPackageInfos(found[0]);
        }
    }
}

function displayPackageInfos(package){

    // Set title
    document.title = `vcpkgx - ${package.name}`;
    // set meta description
    var metadescription = document.getElementById("metadescription");
    metadescription.setAttribute("content", package.description);


    var crumsname = document.getElementById("crumsname");
    crumsname.innerHTML = package.name;

    var name = document.getElementById("name");
    name.innerHTML = package.name;

    

    var version = document.getElementById("version");
    version.innerHTML = package["version"] || package["version-string"] || package["version-semver"]  || package["version-date"];

    var supports = document.getElementById("supports");
    // group array
    var groupedSupport = Object.entries(package["status"])
        .reduce((result, element) =>{
            result[element[0].includes("win") || element[0].includes("uwp")?0:element[0].includes("osx")?1:element.includes("linux")?2:3].push(element);
            return result;
        },[[],[],[],[]])
        .reduce((arr,elem) => {return arr.concat(elem);},[]);
    let warningDep = false;
    for( let item of groupedSupport){
        if (item[1] === "pass") {
            let span = document.createElement("span");
            span.className = "tag has-text-weight-bold";
            span.innerText += item[0];
            failedTriplet[item[0]] = getfailedSupport(item[0],package,new Array())
            if(failedTriplet[item[0]].length === 0){
                span.className+= " is-primary";
            }else{
                span.className+= " is-warning ";
                warningDep = true;
            }

            if(item[0].includes("win") || item[0].includes("uwp")){
                let ispan = document.createElement("span");
                ispan.className = "icon";
                let icon = document.createElement("i");
                icon.className = "fab fa-windows"
                ispan.appendChild(icon);
                span.insertAdjacentElement('afterbegin',ispan);

            } else if(item[0].includes("osx")){
                let ispan = document.createElement("span");
                ispan.className = "icon";
                let icon = document.createElement("i");
                icon.className = "fab fa-apple"
                ispan.appendChild(icon);
                span.insertAdjacentElement('afterbegin',ispan);
            } else if(item[0].includes("linux")){
                let ispan = document.createElement("span");
                ispan.className = "icon";
                let icon = document.createElement("i");
                icon.className = "fab fa-linux"
                ispan.appendChild(icon);
                span.insertAdjacentElement('afterbegin',ispan);
            }

            supports.appendChild(span);
        }
    }

    if(warningDep){
        var depwarning = document.getElementById("depwarning");
        depwarning.classList.remove("is-hidden");

        var depfailures = document.getElementById("depfailures");
        for (const [name,items] of Object.entries(failedTriplet).filter(obj => obj[1].length !== 0)) {
            let triplet = document.createElement("dh");
            triplet.innerText = `${name} :`;
            triplet.className = "has-text-weight-bold"
            depfailures.appendChild(triplet);

            let deps = document.createElement("dd");
            for (const item of items/*.filter(x => package.dependencies.map(x => (typeof x == 'string'? x: x.name) ).includes(x))*/) {
                var tag = document.createElement("a");
                tag.innerText = item;
                tag.className = "tag is-warning is-medium is-link";
                if(Object.values(DataStore).map(x => x.name).includes(item.match(/[\w-]+/).toString()))
                {
                    tag.href = `/details.html?package=${item.match(/[\w-]+/)}`;
                }
                deps.appendChild(tag);
            }
            depfailures.appendChild(deps);
        }

    }
    


    var description = document.getElementById("description");
    description.innerHTML = package.description;

    var installwin = document.getElementById("installwin");
    installwin.innerText = `vcpkg.exe install ${package.name}`;

    var installunix = document.getElementById("installunix");
    installunix.innerText = `vcpkg install ${package.name}`;

    var installwinbtn = document.getElementById("installwinbtn");
    installwinbtn.addEventListener("click", function(){ copyTextToClipboard(`vcpkg.exe install ${package.name}`)},false);

    var installunixbtn = document.getElementById("installunixbtn");
    installunixbtn.addEventListener("click", function(){ copyTextToClipboard(`vcpkg install ${package.name}`)},false);


    var installwinslct = document.getElementById("installwinslct");
    var installunixslct = document.getElementById("installunixslct");
    if (navigator.appVersion.indexOf("Win")!=-1){
        installwinslct.checked = true;
    }else{
        installunixslct.checked = true;
    }

    var usage = document.getElementById("usage");
    if(package.usage){
        usage.innerHTML = package.usage;
        usage.parentNode.classList.remove("is-hidden");
    }else{
        usage.innerHTML = "";
        if(!usage.parentNode.classList.contains("is-hidden")){
            usage.parentNode.classList.add("is-hidden");
        }
    }

    var features = document.getElementById("features");
    features.textContent ='';
    if("features" in package){
        for( const [name,item] of Object.entries(package["features"])){
            let tr = document.createElement("tr");
            let thname = document.createElement("th");
            thname.innerText = name;
            tr.appendChild(thname);
            let description = document.createElement("td");
            description.innerHTML = item.description;
            tr.appendChild(description);
            
            features.appendChild(tr);
        }
    }

    var builddepends = document.getElementById("builddepends");
    builddepends.textContent = '';
    if("dependencies" in package){
        for(let item of package["dependencies"].map(x => (typeof x == 'string'? x: x.name) )){
            var tag = document.createElement("a");
            tag.innerText = item;
            tag.className = "tag is-link";
            if(Object.values(DataStore).map(x => x.name).includes(item.match(/[\w-]+/).toString()))
            {
                tag.href = `/details.html?package=${item.match(/[\w-]+/)}`;
            }
            builddepends.appendChild(tag);
        }
    }

    var versions = document.getElementById("versions");
    if("versions" in package){
        for( let item of Object.values(package["versions"])){
            let version = item["version-string"] || item["version-date"] || item["version-semver"] || item["version"] || ""

            let tr = document.createElement("tr");
            let thversion = document.createElement("th");
            thversion.innerText = version;
            tr.appendChild(thversion);
            let description = document.createElement("td");
            description.innerHTML = item["git-tree"];
            tr.appendChild(description);
            let portversion = document.createElement("td");
            portversion.innerHTML = item["port-version"];
            tr.appendChild(portversion);
            
            versions.appendChild(tr);
        }
    }


    var license = document.getElementById("license");
    var licenseText = package.license;
    if (licenseText == null) {
        licenseText = "Unspecified";
    }
    license.insertAdjacentText('beforeend', " "+licenseText);

    var homepage = document.getElementById("homepage");
    if (package.homepage != null) {
        homepage.href = package.homepage;
    }

    // Github only has 60 request/hour for unauth requests
    // var match = homepageURL.match(/github.com((?:\/[-\w]*){2})/)
    // if(match.length >= 2){
    //     match[1]
    //     fetch(`https://api.github.com/repos${match[1]}`)
    //     .then(function(response) {
    //         if (!response.ok) {
    //             response.
    //             throw Error(response.statusText);
    //         }
    //         return response;
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         addStats(data);
    //         syncStateFromParams();
    //     }).catch(function(error) {
    //         console.log(error);
    //     });
    // }

    var documentation = document.getElementById("documentation");
    if (package.documentation != null) {
        documentation.href = package.documentation;
    }

    if (package.maintainers) {
        var maintainers = document.getElementById("maintainers");
        for (const nameemail of package.maintainers) {
            match = nameemail.match(/(.+)(?=<.*>)/);
            if(match.length>=1){
                let name = document.createElement("p");
                name.className = "subtitle is-5"
                name.innerText = match[1];
                maintainers.insertAdjacentElement('beforeend', name);
            }
        }
    }
    

   

}

function addStats(data){
    var infos = document.getElementById("infos");
    infos.insertAdjacentText('afterend', data);

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

  function back(){
      if(document.referrer.length > 0){
        let prevpage = new URL(document.referrer);
        let currpage = new URL(window.location);
        if(prevpage.hostname === currpage.hostname){
            history.back();
            return;
        }
      }
    window.location = "/"

    
  }

  function getfailedSupport(triplet, package, visited){
    var futureDep = new Array();
    var failedcheck = [];
    if("dependencies" in package){
        for (const depName of package.dependencies.map(x => (typeof x == 'string'? x: x.name) )) {
            var dep = DataStore.filter(x => x.name === depName)[0];
            if(dep.status[triplet] !== "pass"){
                console.log("Support mismatch (pass):",depName, triplet );
                failedcheck.push(depName);
            }
            else if(dep.dependencies)
                futureDep = futureDep.concat(dep.dependencies.map(x => (typeof x == 'string'? x: x.name)))
        }
    }
    // Remove duplicates
    futureDep = [... new Set(futureDep)];
    futureDep = futureDep.filter(x => !visited.includes(x));
    for (const depName of futureDep) {
        if((tmp = getfailedSupport(triplet, DataStore.filter(x => x.name === depName)[0],visited.concat(futureDep))).length !== 0)
        {
            console.log("Support mismatch (rec):",depName, triplet );
            failedcheck.push(depName,...tmp);

        }
    }
    return [... new Set(failedcheck)];
  }