
from typing import DefaultDict


class Pipeline:
    def __init__(self, *args) -> None:
        self.tasks = args

    def run(self, dic = {}):
        for task in self.tasks:
            dic = task(dic)
        return dic

    def __call__(self, dic) :
        return self.run(dic)