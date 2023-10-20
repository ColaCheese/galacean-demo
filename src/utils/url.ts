// get static model resources
function getFileUrl(type: string, path: string, modelName: string, fileType: string): string {
    return `${path}/${type}/${modelName}/${modelName}.${fileType}`;
}


export { getFileUrl }