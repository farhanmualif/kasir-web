export const getAuthToken = () => {
  return localStorage.getItem('userToken') || '';
};