

import argparse, os, json, io

def dir_path(string):
    if os.path.isdir(string):
        return string
    else:
        raise NotADirectoryError(string)


# Parse CONTROL File
def simpleInsert(dic, line):
    dic[line.split(':')[0].strip()] = ':'.join([s.strip() for s in line.split(':')[1:]])

def simpleInsertList(dic, line):
    dic[line.split(':')[0].strip()] = [i.strip() for i in line.split(':')[1].split(",")]




def parseControlSource(dic, line):
    dic["Source"] = line


controlSpecialParser = {
    "Source" : simpleInsert,
    "Version": simpleInsert,
    "Build-Depends": simpleInsertList,
    "Default-Features": simpleInsertList,
    "Description": simpleInsert,
    "Homepage": simpleInsert
}

def parseControlLine(dic, line):
    parser = controlSpecialParser.get(line.split(':')[0])
    if(parser != None):
        parser(dic,line)

def parseControlFeatureParagraph(dic, para):
    if(len(para.strip()) == 0):
        print("Empty:")
    features = dic.get("Features")
    if(features == None):
        dic["Features"] = {}

    lines = io.StringIO(para)
    # Feature name (find the str containing "Feature:")
    fname = [s for s in lines if "Feature:" in s][0].split(":")[1].strip()

    #reset the cursor to the begining of the file
    lines.seek(0)

    fdic = {}
    # Parse Feature paragraph in a feature dictionary (skip first because it's the name)
    [parseControlLine(fdic,line) for line in lines if "Feature" not in line]
    dic["Features"][fname] = fdic

def parseControlSourceParagraph(dic, para):
    buf = io.StringIO(para)
    [parseControlLine(dic,line) for line in buf]

def partseControlFile(file):
    dic={}
    with open(file, "r",encoding="utf8") as f:
        lines = f.read()
        sections = lines.split("\n\n")
        parseControlSourceParagraph(dic, sections[0])
        [parseControlFeatureParagraph(dic, para) for para in sections[1:] if len(para.strip()) != 0]
        # [parseControlLine(dic,line) for line in f]
    return dic

def convertControlObjToManifest(obj):
    convObj = {}
    for key, value in obj.items():
        if(key == 'Source'):
            convObj['name'] = value
        elif(key == 'Version'):
            convObj['version-string'] = value
        elif(key == 'Description'):
            convObj['description'] = value
        elif(key == 'Build-Depends'):
            convObj['dependencies'] = value
        elif(key == 'Homepage'):
            convObj['homepage'] = value
        elif(key == 'Default-Features'):
            convObj['default-features'] = value
        elif(key == 'Features'):
            arr = []
            for k,v in value.items():
                tmpdic = {}
                tmpdic['name'] = k
                tmpdic['description'] = v.get('Description','')
                if( 'Build-Depends' in v):
                    tmpdic['dependencies'] = v['Build-Depends']
                arr.append(tmpdic)
            convObj['features'] = arr
        else:
            print('Missing:',key,'with value:', value)
    return convObj

def addUsage(item, usagefiles):
    name = item["name"]
    for filename in usagefiles:
        if( name == filename.split(os.sep)[-2]):
            with open(filename) as f:
                item["usage"] = f.read()
            usagefiles.remove(filename)

        
parser = argparse.ArgumentParser()
parser.add_argument('SourceDirectory',type=dir_path,help="location of the port folder of the vcpkg to parse")
parser.add_argument('-o',type=dir_path,help="output of the JSON file generated", default="./")

args = parser.parse_args()

# Get all the names of the dirs inside of "ports"
controlfiles = []
vcpkgfiles = []
usagefiles = []
# r=root, d=directories, f = files
for r, d, f in os.walk(args.SourceDirectory):
    for file in f:
        if 'vcpkg.json' == file:
            vcpkgfiles.append(os.path.join(r, file))
        elif 'CONTROL' == file:
            controlfiles.append(os.path.join(r, file))
        elif 'usage' == file:
            usagefiles.append(os.path.join(r, file))


print(args)
dic = []

# Parse CONTROL file
for item in [convertControlObjToManifest(partseControlFile(f)) for f in controlfiles]:
    addUsage(item,usagefiles)
    dic.append(item)
# Parse Manifest files
for filename in vcpkgfiles:
    js = None
    with open(filename) as f:
        js = json.load(f)
    addUsage(js, usagefiles)
    dic.append(js)
    
# output JSON
with open(args.o+"libs.json", 'w') as outf:
    json.dump(dic, outf)
