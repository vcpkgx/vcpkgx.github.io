
import os
from parsers.baseline_parser import parse_baseline_file
from parsers.status_parser import evalEBNF, allTargetsDict


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
                # new way of declaring
                if "supports" in package:
                    for triplet in dic["triplets"]['built-in']:
                        tripComponents = allTargetsDict(dic["triplets"], False) 
                        tripComponents.update(dict((x,True) for x in triplet.split("-")))
                        ebnfstr = package["supports"].replace("&"," and ").replace("|"," or ").replace("!"," not ")
                        status[triplet] =  "pass" if evalEBNF(ebnfstr, tripComponents) else "fail"
                    
                # old way of declaring
                else:
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

