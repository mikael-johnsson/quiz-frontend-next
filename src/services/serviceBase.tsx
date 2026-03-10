export const getData = async (
  URL: string,
  themesUrl: string,
  difficultiesUrl: string,
) => {
  return fetch(`${URL}${themesUrl}${difficultiesUrl}`);
};
