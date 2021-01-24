
import os


class AddTriplets:
    def __init__(self, path):
        self.path = path

    def __call__(self, dic):
        triplets_built_in_path = self.path
        triplets_community_path = os.path.join(triplets_built_in_path, "community")

        triplets = {
            'built-in': [f[:-len('.cmake')] for f in os.listdir(triplets_built_in_path) if os.path.isfile(os.path.join(triplets_built_in_path,f)) and f.endswith('.cmake')],
            'community': [f[:-len('.cmake')] for f in os.listdir(triplets_community_path) if os.path.isfile(os.path.join(triplets_community_path,f)) and f.endswith('.cmake')]
            }
        dic["triplets"] = triplets

        return dic