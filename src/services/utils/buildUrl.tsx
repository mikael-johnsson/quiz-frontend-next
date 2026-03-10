export const buildUrl = (array: string[], type: string) => {
  let url: string = "";
  array.forEach((el) => {
    url = url + type + el;
  });

  return url;
};
