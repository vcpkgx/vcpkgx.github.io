import json
import os
class WriteJSON:
    def __init__(self, path, name):
        self.path = path
        self.name = name
    
    def __call__(self, dic):
        
        with open(os.path.join(self.path, self.name), 'w') as outf:
            json.dump(dic, outf)
        
        return dic