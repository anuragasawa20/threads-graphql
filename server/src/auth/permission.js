export const Permissions = {
    POST_CREATE: "post:create",
    POST_UPDATE: "post:update",
    POST_DELETE: "post:delete",

    COMMENT_CREATE: "comment:create",
    COMMENT_UPDATE: "comment:update",
    COMMENT_DELETE: "comment:delete",

    LIKE_CREATE: "like:create",
    LIKE_DELETE: "like:delete"
};

export const ROLE_PERMISSIONS = {
    USER: [
        Permissions.POST_CREATE,
        Permissions.POST_UPDATE,
        Permissions.COMMENT_CREATE,
        Permissions.COMMENT_UPDATE,
        Permissions.LIKE_CREATE,
        Permissions.LIKE_DELETE
    ],
    ADMIN: ["*"]
};


export function Authorized(permission, user) {

    if (user.role === 'admin') return true;
    return ROLE_PERMISSIONS[(user.role).toUpperCase()]?.includes(permission) ?? false;
}