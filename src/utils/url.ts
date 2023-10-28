// get static model resources
function getFileUrl(type: string, path: string, modelName: string, fileType: string): string {
    return `${path}/${type}/${modelName}/${modelName}.${fileType}`;
}


function getSceneFileUrl(modelName: string, fileName: string, fileType: string): string {
    return new URL(`../assets/scene/${modelName}/${fileName}.${fileType}`, import.meta.url).href;
}


export { getFileUrl, getSceneFileUrl }