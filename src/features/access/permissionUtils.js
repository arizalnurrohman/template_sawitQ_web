import { normalizePermissions } from "../../config/access.js";

// Mengubah berbagai bentuk respons permission backend menjadi peta:
// { [menuId]: { view, add, edit, delete } }
export function toMatrix(permissions) {
  if (!permissions) return {};
  if (Array.isArray(permissions)) {
    return permissions.reduce((matrix, entry) => {
      const menuId = entry.menu_id ?? entry.menu?.id ?? entry.id;
      if (!menuId) return matrix;
      if (!matrix[menuId]) matrix[menuId] = normalizePermissions();
      const action = entry.action || entry.name || entry.permission;
      if (action && action in matrix[menuId]) matrix[menuId][action] = true;
      return matrix;
    }, {});
  }
  return Object.fromEntries(
    Object.entries(permissions).map(([menuId, actions]) => [
      menuId,
      normalizePermissions(actions),
    ]),
  );
}
