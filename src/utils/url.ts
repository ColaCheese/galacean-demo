// get static model resources
function getModelFileUrl(modelName: string, fileType: string): string {
    return new URL(`../models/${modelName}/${modelName}.${fileType}`, import.meta.url).href;
}


export default getModelFileUrl