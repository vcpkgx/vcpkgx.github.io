import os
from parsers.version_parser import parse_version_file
class AddVersion:
    def __init__(self, path):
        self.path = path

    def __call__(self, dic):
        
        for package in dic["packages"]:
            name = package["name"]
            version_path = os.path.join(self.path, f"{name[0]}-/{name}.json")
            package["versions"] = parse_version_file(version_path)
        return dic