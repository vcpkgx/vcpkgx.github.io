import os
import codecs
class WriteSitemaps:
    def __init__(self, path, name):
        self.path = path
        self.name = name
    
    def __call__(self, dic):
        
        with codecs.open(os.path.join(self.path, self.name), 'w', encoding='utf-8') as outf:
            outf.write("http://vcpkgx.com/index.html\n")
            pages ="\n".join([f'http://vcpkgx.com/details.html?package={ package["name"] }' for package in dic["packages"] ])
            outf.writelines(pages)
            # for package in dic["packages"]:

        
        return dic