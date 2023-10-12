// get static model resources
function getModelFileUrl(path: string, modelName: string, fileType: string): string {
    return `${path}models/${modelName}/${modelName}.${fileType}`;
}


export default getModelFileUrl