import json


def convert_control_obj_to_manifest(obj):
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

def parse_manifest_file(file_path):
    js = None
    with open(file_path, encoding="utf8") as f:
        js = json.load(f)
    return js