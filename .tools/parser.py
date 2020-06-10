

import argparse, os, json, io

def dir_path(string):
    if os.path.isdir(string):
        return string
    else:
        raise NotADirectoryError(string)

def dir_path(string):
    if os.path.isdir(string):
        return string
    else:
        raise NotADirectoryError(string)

# Parse CONTROL File
def simpleInsert(dic, line):
    dic[line.split(':')[0].strip()] = line.split(':')[1].strip()

def simpleInsertList(dic, line):
    dic[line.split(':')[0].strip()] = [i.strip() for i in line.split(':')[1].split(",")]




def parseControlSource(dic, line):
    dic["Source"] = line


controlSpecialParser = {
    "Source" : simpleInsert,
    "Version": simpleInsert,
    "Build-Depends": simpleInsertList,
    "Default-Features": simpleInsertList,
    "Description": simpleInsert
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
    # print("="*10)
    # print(para)
    # print("="*10)

    lines = io.StringIO(para)
    # Feature name (find the str containing "Feature:")
    fname = [s for s in lines if "Feature:" in s][0].split(":")[1].strip()
    fdic = {}
    # Parse Feature paragraph in a feature dictionary (skip first because it;s the name)
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



parser = argparse.ArgumentParser()
parser.add_argument('SourceDirectory',type=dir_path,help="location of the port folder of the vcpkg to parse")
parser.add_argument('-o',type=dir_path,help="output of the JSON file generated", default="./")

args = parser.parse_args()

# Get all the names of the dirs inside of "ports"
controlfiles = []
# r=root, d=directories, f = files
for r, d, f in os.walk(args.SourceDirectory):
    for file in f:
        if 'CONTROL' == file:
            controlfiles.append(os.path.join(r, file))

print(args)
dic = {}
for item in [partseControlFile(f) for f in controlfiles]:
    name = item["Source"]
    del item["Source"]
    dic[name] = item
with open(args.o+"libs.json", 'w') as outf:
    json.dump(dic, outf)
# print([partseControlFile(f) for f in controlfiles])
    # print(f) 

# print(namelist)