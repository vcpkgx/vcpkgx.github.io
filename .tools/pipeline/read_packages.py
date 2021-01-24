import os
from parsers.control_parser import parse_control_file
from parsers.manifest_parser import parse_manifest_file, convert_control_obj_to_manifest

class ReadPackages:
    def __init__(self, path):
        self.path = path

    def __call__(self,dic):
        dic["packages"] = []

        for package in [dir for dir in os.listdir(self.path) if os.path.isdir(os.path.join(self.path,dir))]:
            current_package_path = os.path.join(self.path, package)
            current_package_obj = {}
            if os.path.isfile(os.path.join(current_package_path,"vcpkg.json")):
                current_package_obj = parse_manifest_file(os.path.join(current_package_path,"vcpkg.json"))
                pass
            elif os.path.isfile(os.path.join(current_package_path,"CONTROL")):
                current_package_obj = convert_control_obj_to_manifest(parse_control_file(os.path.join(current_package_path,"CONTROL")))
                pass
            else:
                # TODO: log error (invalid package?)
                continue
            
            dic["packages"].append(current_package_obj)

        return dic


