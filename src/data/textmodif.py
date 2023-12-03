import os, re

with open("francais.txt", "r") as input:
    with open("temp.txt", "w") as output:
        output.write("[")
        # iterate all lines from file
        for line in input:
            match = re.search("[A-Z-]", line)
            stripped = line.strip()
            length = len(stripped)
            # if substring contain in a line then don't write it
            if match is None and not line.isspace() and length >= 4 and length <= 9:
                string = '"'+stripped+'",'
                output.write(string)

        output.write("]")

# replace file with original name
os.replace('temp.txt', 'francais_4_to_9.json')