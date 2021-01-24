
def parse_usage_file(item, usage_file_path):
    with open(usage_file_path) as f:
        item["usage"] = f.read()