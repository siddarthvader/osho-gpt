export function isValidJSON(str) {
  try {
    const parsedJSON = JSON.parse(str);
    return (
      typeof parsedJSON === "object" &&
      parsedJSON !== null &&
      !Array.isArray(parsedJSON)
    );
  } catch (error) {
    return false;
  }
}