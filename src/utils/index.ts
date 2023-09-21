// export * from './userPermission';
// export * from './time';

// Get static model resources
export const getModelFileUrl = (modelName: string, fileType: string) => {

    return new URL(`../models/${modelName}/${modelName}.${fileType}`, import.meta.url).href;
};

export default {
    getModelFileUrl,
};
