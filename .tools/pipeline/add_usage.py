
import os
from parsers.usage_parser import parse_usage_file

class AddUsage:
    def __init__(self, path) -> None:
        self.path = path

    def __call__(self,dic):
        for package in dic["packages"]:
            name = package["name"]
            package_path = os.path.join(self.path, name)
            usage_path = os.path.join(package_path,"usage")

            if os.path.isfile(usage_path):
                parse_usage_file(package, usage_path)
        
        return dic