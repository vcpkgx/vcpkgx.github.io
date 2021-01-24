
import os
from parsers.baseline_parser import parse_baseline_file


class AddStatus:
    def __init__(self, path):
        self.path = path

    def __call__(self, dic):
        packages = dic["packages"]
        baseline_path = self.path
        if os.path.isfile(baseline_path):
            packageStatus = parse_baseline_file(baseline_path)

            for package in dic["packages"]:
                status = {}

                for triplet in dic["triplets"]['built-in']:
                    if(package["name"]+":"+triplet in packageStatus):
                        status[triplet] = packageStatus[package["name"]+":"+triplet]
                    else:
                        status[triplet] = "pass"

                package["status"] = status
        else:
            # TODO: log error missing ci.baseline.txt
            pass

        return dic
        
