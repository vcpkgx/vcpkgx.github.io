import json
def parse_version_file(version_file_path):
    js = None
    with open(version_file_path, encoding="utf8") as f:
        js = json.load(f)
    return js["versions"]
