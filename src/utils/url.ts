// get static model resources
function getFileUrl(type: string, path: string, modelName: string, fileType: string): string {
    return `${path}/${type}/${modelName}/${modelName}.${fileType}`;
}


function getSceneFileUrl(path: string, modelName: string, fileName: string, fileType: string): string {
    return `${path}/scene/${modelName}/${fileName}.${fileType}`;
}


export { getFileUrl, getSceneFileUrl }