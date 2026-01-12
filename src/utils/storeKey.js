export const getStoreId = () => {
  try {
    const session = JSON.parse(localStorage.getItem("owner_session"));
    return session?.id || "default";
  } catch {
    return "default"; 
  }
};

export const withStoreKey = (baseKey) => {
  const storeId = getStoreId();
  return `${baseKey}__${storeId}`;
};
