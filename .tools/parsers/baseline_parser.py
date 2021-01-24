import re


def parse_baseline_file(path):
    packageStatus = {}

    reg = re.compile(r"^\s*([\w-]+)\s*:\s*([\w-]+)\s*=\s*(\w+)\s*$", re.MULTILINE)
    with open(path) as file:
        out = reg.findall(file.read())
        for name,triplet,status in out:
            packageStatus[name+":"+triplet] = status
    return packageStatus