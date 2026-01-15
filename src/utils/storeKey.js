import { getStoreName } from "./storeInfo";

export const getStoreId = () => {
  try {
    const session = JSON.parse(localStorage.getItem("owner_session"));
    const ownerId = session?.id || "default";
    const storeName = getStoreName();
    return `${ownerId}__${storeName}`;
  } catch {
    return "default"; 
  }
};

export const withStoreKey = (baseKey) => {
  const storeId = getStoreId();
  return `${baseKey}__${storeId}`;
};
