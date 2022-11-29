
def evalEBNF(ebnf:str, platform:dict)->bool:
    try:
        return eval(ebnf,platform)
    except NameError as e:
        print("NE:", e)
        return True


triplet_patch = ["native", "staticcrt"]
def allTargetsDict(triplets:dict, defaultValue:bool)->dict:
    out= {} 
    for group in [triplets["built-in"]]:
        for triplet in group: 
            out.update(dict((x,defaultValue) for x in triplet.split("-")))

    out.update(dict((x,defaultValue) for x in triplet_patch))
    
    return out
