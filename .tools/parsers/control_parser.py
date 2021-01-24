# Parse CONTROL File
import io


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

def parse_control_file(file):
    dic={}
    with open(file, "r",encoding="utf8") as f:
        lines = f.read()
        sections = lines.split("\n\n")
        parseControlSourceParagraph(dic, sections[0])
        [parseControlFeatureParagraph(dic, para) for para in sections[1:] if len(para.strip()) != 0]
        # [parseControlLine(dic,line) for line in f]
    return dic
