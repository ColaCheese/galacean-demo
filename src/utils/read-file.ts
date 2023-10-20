import { getFileUrl } from "./url";


// read file according to file type, default is json
function readFile(path: string, file: string, type: string = "json"): any {

    let url = getFileUrl("model", path, file, type);

    let context = loadFile(url);

    if (context === null) {
        return null;
    } else{
        switch (type) {
            case "json":
                return JSON.parse(context);
            case "text":
                return context;
            default:
                return null;
        }
    }
}

// use XMLHttpRequest to load local resource as a text file
function loadFile(url: string): string | null {

    const xhr = new XMLHttpRequest();
    const okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/html; charset=utf-8");
    xhr.send(null);

    return xhr.status === okStatus ? xhr.responseText : null;
}

export default readFile;