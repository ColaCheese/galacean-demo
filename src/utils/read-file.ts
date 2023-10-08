import getModelFileUrl from "./url";

// read file according to file type, default is json
function readFile(file: string, type: string = "json"): any {

    let fileContext = loadFile(file, type);

    if (fileContext === null) {
        return null;
    } else{
        switch (type) {
            case "json":
                return JSON.parse(fileContext);
            case "text":
                return fileContext;
            default:
                return null;
        }
    }
}

// use XMLHttpRequest to load file
function loadFile(name: string, type: string): string | null {

    const xhr = new XMLHttpRequest();
    const okStatus = document.location.protocol === "file:" ? 0 : 200;
    const url = getModelFileUrl(name, type);
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/html; charset=utf-8");
    xhr.send(null);
    return xhr.status === okStatus ? xhr.responseText : null;
}

export default readFile;