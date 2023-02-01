import argparse
import os
from utils.args_filter import dir_path
from pipeline.pipeline import Pipeline
from pipeline.read_packages import ReadPackages
from pipeline.add_usage import AddUsage
from pipeline.add_status import AddStatus
from pipeline.add_triplets import AddTriplets
from pipeline.add_version import AddVersion
from pipeline.add_timestamp import AddTimestamp
from pipeline.write_json import WriteJSON
from pipeline.write_sitemaps import WriteSitemaps


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('SourceDirectory',type=dir_path,help="location of the vcpkg folder")
    parser.add_argument('-o',type=dir_path,help="output of the JSON file generated", default="./")

    args = parser.parse_args()

    ports_path = os.path.join(args.SourceDirectory, "ports")
    triplets_path = os.path.join(args.SourceDirectory, "triplets")
    baseline_path = os.path.join(args.SourceDirectory,"scripts/ci.baseline.txt")
    version_path = os.path.join(args.SourceDirectory, "versions")
    data_out_path = os.path.join(args.o,"data")

    pipeline  = Pipeline(
            ReadPackages(ports_path),
            AddUsage(ports_path),
            AddTriplets(triplets_path),
            AddStatus(baseline_path),
            AddVersion(version_path),
            # AddTimestamp(),
            WriteJSON(data_out_path, "libs.json"),
            WriteSitemaps(args.o,"sitemap.txt")
        )

    pipeline.run()
    

