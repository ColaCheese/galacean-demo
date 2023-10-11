// read directory and return file list
function readDir(pathMap: Record<string, () => Promise<{ [key: string]: any; }>>): string[] {

    // search all the dirs contain flag files in a certain path
    let modelList = Object.keys(pathMap).map((path: string) => {
        return path.split("/")[2]
    })

    return modelList;
}


export default readDir;