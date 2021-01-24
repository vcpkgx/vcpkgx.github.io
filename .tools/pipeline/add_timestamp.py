from datetime import datetime
class AddTimestamp:
    def __init__(self):
        pass

    def __call__(self, dic):
        dic["timestamp"] = datetime.now().isoformat()

        return dic