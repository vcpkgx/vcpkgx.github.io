import argparse
import json

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('Source',type=str,help="location of the vcpkg folder")

    args = parser.parse_args()

    data = json.load(open(args.Source))

    count = dict.fromkeys(data["triplets"]["built-in"],0)

    for pkg in data["packages"]:
        if "status" in pkg:
            for triplet, status in pkg["status"].items():
                if status == "pass":
                    count[triplet] += 1

    print("Total : ", len(data["packages"]))
    for triplet, nb in count.items():
        print(triplet,":", nb)
