// get static model resources
function getModelFileUrl(path: string, modelName: string, fileType: string): string {
    return `${path}/models/${modelName}/${modelName}.${fileType}`;
}

// get static particle resources
function getParticleFileUrl(path: string, particleName: string, fileType: string): string {
    return `${path}/particles/${particleName}/${particleName}.${fileType}`;
}


export { getModelFileUrl, getParticleFileUrl }