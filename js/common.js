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

function getPackageVersion(package)
{
  return package["version"] || package["version-string"] || package["version-semver"]  || package["version-date"] || "";
}

function getDependencies(package)
{
  return package["dependencies"]?.map(x => (typeof x == 'string'? x: x.name) )||[];
}